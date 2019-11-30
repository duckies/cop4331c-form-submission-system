import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindFormDto } from '../form/dto/find-form.dto';
import { FieldType, Question } from '../question/question.entity';
import { QuestionService } from '../question/question.service';
import { AnswersDto } from './dto/create-submission.dto';
import { Submission } from './submission.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission) private readonly submissionRepository: Repository<Submission>,
    private readonly questionService: QuestionService,
  ) {}

  /**
   * Creates a new form submission.
   * @param createSubmissionDto
   */
  async create(findFormDto: FindFormDto, files: Record<string, unknown>, answerData: AnswersDto): Promise<Submission> {
    const { answers, questions } = await this.validateSubmission(findFormDto.id, answerData, files);

    // Sets questions that have been answered as such.
    const promises = [];
    questions.forEach(q => {
      q.answered = true;
      promises.push(q.save());
    });
    await Promise.all(promises);

    return this.submissionRepository.save({ formId: findFormDto.id, answers });
  }

  /**
   * Retrieves an individual submission.
   * @param id Submission uuid.
   */
  findOne(id: number): Promise<Submission> {
    return this.submissionRepository
      .createQueryBuilder('submission')
      .where('submission.id = :id', { id })
      .leftJoinAndSelect('submission.form', 'form')
      .leftJoinAndSelect('form.questions', 'questions')
      .orderBy({ 'questions.order': 'ASC' })
      .getOne();
  }

  /**
   * Retrieves submissions for a form.
   * @param id Form id.
   */
  findByForm(id: number): Promise<Submission[]> {
    return this.submissionRepository.find({ where: { formId: id }, relations: ['form'], order: { id: 'DESC' } });
  }

  /**
   * Verifies that the structure of a form's questions matches that
   * of the answers being submitted. This does not handle FileInput fields.
   *
   * @param formId Form to verify the answer schema of.
   * @param answers Array of AnswerDto entities.
   */
  async validateSubmission(
    formId: number,
    answers: AnswersDto,
    files: Record<string, unknown>,
  ): Promise<{ answers: Record<string, string>; questions: Question[] }> {
    const parsedAnswers = {};
    const answeredQuestions = [];
    // Note that deleted questions are also selected.
    const questions = await this.questionService.findByForm(formId);

    // Do not accept blank submissions.
    if (!questions || !questions.length) {
      throw new BadRequestException('There are no questions in this form.');
    }

    // No blank submissions.
    if (!answers || !files) {
      throw new BadRequestException('The submitted form is empty.');
    }

    for (const question of questions) {
      if (question.deleted) continue;

      if (!this.hasProperty(files, question.id) && !this.hasProperty(answers, question.id)) {
        // Answer is missing for a required question.
        if (question.required === true) {
          throw new BadRequestException(`Question '${question.id}' is required.`);
        }

        // Non-required questions can be skipped.
        continue;
      }

      if (question.type === FieldType.FileInput) {
        answeredQuestions.push(question);
        parsedAnswers[question.id] = files[question.id];
        continue;
      }

      if (this.isArrayOfStrings(answers[question.id])) {
        let values = [];
        questions.forEach((q: Question) => {
          if (q.choices) {
            q.choices.forEach((c: string) => values.push(c));
          }
        });

        // Error if there are multiple values but aren't allowed to.
        // However, we should be able to have arrays of single strings, e.g., ["Apple"]
        if (!question.multiple && answers[question.id].length > 1) {
          throw new BadRequestException(`Question '${question.id}' does not allow multiple values.`);
        }

        // If we have multiple we inherently have choices (since we're not dealing with FileInput.)
        // Uses a buffer array to determine there are repeats inappropriately, e.g., ["Apple", "Apple"]
        for (const value of answers[question.id]) {
          if (!values.includes(value)) {
            throw new BadRequestException(
              `Question '${question.id}' only allows the choices: {${question.choices}}. Be careful of duplicates.`,
            );
          }

          values = values.filter(v => v !== value);
        }
        // Checkbox, Radio, and Dropdown scenario with only one allowable choice.
      } else if (question.choices && !question.choices.includes(answers[question.id] as string)) {
        throw new BadRequestException(`Question '${question.id}' does not allow the option '${answers[question.id]}'`);
      }

      answeredQuestions.push(question);
      parsedAnswers[question.id] = answers[question.id];
    }

    return { answers: parsedAnswers, questions: answeredQuestions };
  }

  /**
   * Determins if the passed value is an array of strings.
   * @param value Any value.
   */
  isArrayOfStrings(value: unknown): boolean {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  }

  /**
   * The objects returned by multer can be lacking prototypes,
   * thus we can use the parent Object prototype.
   * @param object
   * @param property
   */
  hasProperty(object: Record<string, unknown>, property: string): boolean {
    return object && Object.prototype.hasOwnProperty.call(object, property);
  }
}
