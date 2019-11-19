import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question, FieldType } from './question.entity';
import { Repository, Between } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private readonly questionRepository: Repository<Question>) {}

  /**
   * Creates a new question for a form.
   * Note that the order value needs to be unique.
   * @param createQuestionDto
   */
  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const orderExists = await this.questionRepository.findOne({
      formId: createQuestionDto.formId,
      order: createQuestionDto.order,
    });

    // To uncomplicate our queries, duplicate orders are not permitted.
    // Experiment not including this for performance benefits later on.
    if (orderExists) {
      throw new BadRequestException(`A question with order of ${createQuestionDto.order} already exists.`);
    }

    const type = createQuestionDto.type;
    const canHaveChoices = type === FieldType.Dropdown || type === FieldType.Checkbox || type === FieldType.Radio;
    const canHaveMultiple = type === FieldType.Dropdown || type === FieldType.Checkbox || type === FieldType.FileInput;
    const question = this.questionRepository.merge(new Question(), createQuestionDto);

    question.deleted = false;

    // This can be moved to a custom validator file later as this is static validation.

    // Choices is only appropriate for Dropdown, Checkbox, and Radio fields.
    if (typeof createQuestionDto.choices !== 'undefined' && !canHaveChoices) {
      throw new BadRequestException(`'choices' property was found but is not appropriate for a ${type} field.`);
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
    const currentPos = question.order;
    const desiredPos = updateQuestionDto.order;

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

    if (desiredPos && currentPos !== desiredPos) {
      const move = desiredPos > currentPos ? 'down' : 'up';

      // Changes in this block occur in a transaction, meaning if they fail it's reverted.
      await this.questionRepository.manager.transaction(async (entityManager) => {
        // We normally do not allow a question to have an order of 0
        // so we may use it here as a temporary placeholder.
        question.order = 0;
        await entityManager.save(question);

        // Decrement items between the current position and the desired position.
        if (move === 'down') {
          await entityManager.decrement(Question, { order: Between(currentPos, desiredPos) }, 'order', 1);
        }

        // Increment items from desired position and the current position.
        if (move === 'up') {
          await entityManager.increment(Question, { order: Between(desiredPos, currentPos) }, 'order', 1);
        }
      });
    }

    this.questionRepository.merge(question, updateQuestionDto);

    return this.questionRepository.save(question);
  }

  /**
   * Deletes a question by soft deletion if there are any submissions present.
   * @param id Question uuid.
   */
  async delete(id: string): Promise<Question> {
    // TODO: Update this to scan for submissions for soft-deletion.
    const question = await this.questionRepository.findOneOrFail(id);

    return this.questionRepository.remove(question);
  }
}
