import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderQuestionDto } from './dto/reorder-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FieldType, Question } from './question.entity';

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private readonly questionRepository: Repository<Question>) {}

  /**
   * Creates a new question for a form.
   * Note that the order value needs to be unique.
   * @param createQuestionDto
   */
  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const type = createQuestionDto.type;
    const canHaveChoices = type === FieldType.Dropdown || type === FieldType.Checkbox || type === FieldType.Radio;
    const canHaveMultiple = type === FieldType.Dropdown || type === FieldType.Checkbox || type === FieldType.FileInput;
    const question = this.questionRepository.merge(new Question(), createQuestionDto);

    question.deleted = false;

    // Choices is only appropriate for Dropdown, Checkbox, and Radio fields.
    if (typeof createQuestionDto.choices !== 'undefined' && !canHaveChoices) {
      throw new BadRequestException(`'choices' property was found but is not appropriate for a ${type} field.`);
    }

    if (
      typeof createQuestionDto.choices === 'undefined' &&
      (type === FieldType.Checkbox || type === FieldType.Radio || type == FieldType.Dropdown)
    ) {
      throw new BadRequestException(`'choices' property was not found but is required for ${type} field.`);
    }

    // Multiple is only appropriate for Dropdown, Checkbox, and File Upload fields.
    if (typeof createQuestionDto.multiple !== 'undefined' && !canHaveMultiple) {
      throw new BadRequestException(`'multiple' property was found but is not appropriate for a ${type} field.`);
    }

    // You cannot have multiple choices without literally having multiple choices.
    if (
      typeof createQuestionDto.choices !== 'undefined' &&
      typeof createQuestionDto.multiple !== 'undefined' &&
      createQuestionDto.choices.length === 1
    ) {
      throw new BadRequestException(`There cannot be only one choice and multiple allowable selections.`);
    }

    // FileMaxCount is only for FileInput fields.
    if (typeof createQuestionDto.fileMaxCount !== 'undefined' && type !== FieldType.FileInput) {
      throw new BadRequestException(`'fileMaxCount' property was found but is not appropriate for a ${type} field.`);
    }

    // FileMaxCount is required for FileInput fields.
    if (typeof createQuestionDto.fileMaxCount === 'undefined' && type === FieldType.FileInput) {
      throw new BadRequestException(`'fileMaxCount' property was not found and is required for a ${type} field.`);
    }

    // MimeTypes is only for FileInput fields.
    if (typeof createQuestionDto.mimeTypes !== 'undefined' && type !== FieldType.FileInput) {
      throw new BadRequestException(`'mimeTypes' property was found but is not appropriate for a ${type} field.`);
    }

    // MimeTypes are required when dealing with FileInput fields.
    if (typeof createQuestionDto.mimeTypes === 'undefined' && question.type === FieldType.FileInput) {
      throw new BadRequestException(`'mimeTypes' property was not found and is required for a ${question.type} field.`);
    }

    // This is being saved in a relation by the required formId property.
    return this.questionRepository.save(question);
  }

  /**
   * Retrieves an individual question.
   * @param id Question UUID.
   */
  findOne(id: string): Promise<Question> {
    return this.questionRepository.findOne(id);
  }

  /**
   * Retrieves all questions for a specific form.
   * @param id Question UUID.
   */
  findByForm(id: number): Promise<Question[]> {
    return this.questionRepository.find({ formId: id });
  }

  /**
   * Retrieves all questions for a specified form of a specific type.
   * @param id Form id.
   * @param type FieldType of the questions to return.
   */
  findByFormAndType(id: number, type: FieldType): Promise<Question[]> {
    return this.questionRepository.find({ formId: id, type });
  }

  /**
   * Updates a question's attributes.
   * @param id Question uuid.
   * @param updateQuestionDto
   */
  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionRepository.findOneOrFail(id);
    const canHaveChoices =
      question.type === FieldType.Dropdown || question.type === FieldType.Checkbox || question.type === FieldType.Radio;
    const canHaveMultiple =
      question.type === FieldType.Dropdown ||
      question.type === FieldType.Checkbox ||
      question.type === FieldType.FileInput;
    // const currentPos = question.order;
    // const desiredPos = updateQuestionDto.order;

    // Choices is only appropriate for Dropdown, Checkbox, and Radio fields.
    if (typeof updateQuestionDto.choices !== 'undefined' && !canHaveChoices) {
      throw new BadRequestException(
        `'choices' property was found but is not appropriate for a ${question.type} field.`,
      );
    }

    // Multiple is only appropriate for Dropdown, Checkbox, and File Upload fields.
    if (typeof updateQuestionDto.multiple !== 'undefined' && !canHaveMultiple) {
      throw new BadRequestException(
        `'multiple' property was found but is not appropriate for a ${question.type} field.`,
      );
    }

    // You cannot have multiple choices without literally having multiple choices.
    if (
      typeof updateQuestionDto.choices !== 'undefined' &&
      typeof updateQuestionDto.multiple !== 'undefined' &&
      updateQuestionDto.choices.length === 1
    ) {
      throw new BadRequestException(`There cannot be only one choice and multiple allowable selections.`);
    }

    // FileMaxCount is only for FileInput fields.
    if (typeof updateQuestionDto.fileMaxCount !== 'undefined' && question.type !== FieldType.FileInput) {
      throw new BadRequestException(
        `'fileMaxCount' property was found but is not appropriate for a ${question.type} field.`,
      );
    }

    // MimeTypes is only for FileInput fields.
    if (typeof updateQuestionDto.mimeTypes !== 'undefined' && question.type !== FieldType.FileInput) {
      throw new BadRequestException(
        `'mimeTypes' property was found but is not appropriate for a ${question.type} field.`,
      );
    }

    this.questionRepository.merge(question, updateQuestionDto);

    return this.questionRepository.save(question);
  }

  async reorder(reorderQuestionDto: ReorderQuestionDto): Promise<void[]> {
    const promises = reorderQuestionDto.questions.map(question => {
      this.questionRepository
        .createQueryBuilder()
        .update(Question)
        .set({ order: question.order })
        .where('question.id = :id', { id: question.id })
        .execute();
    });

    return Promise.all(promises);
  }

  /**
   * Deletes a question by soft deletion if there are any submissions present.
   * @param id Question uuid.
   */
  async delete(id: string): Promise<Question> {
    // TODO: Update this to scan for submissions for soft-deletion.
    const question = await this.questionRepository.findOneOrFail(id);

    if (question.answered) {
      question.deleted = true;
      return this.questionRepository.save(question);
    }

    return this.questionRepository.remove(question);
  }
}
