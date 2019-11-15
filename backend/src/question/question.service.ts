import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Question, FieldType } from './question.entity'
import { Repository, Between } from 'typeorm'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private readonly questionRepository: Repository<Question>) {}

  create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const question = this.questionRepository.merge(new Question(), createQuestionDto)

    question.deleted = false

    // This can be moved to a custom validator file later as this is static validation.

    // Choices is only appropriate for Dropdown, Checkbox, and Radio fields.
    if (
      typeof createQuestionDto.choices !== 'undefined' &&
      createQuestionDto.type !== FieldType.Dropdown &&
      createQuestionDto.type !== FieldType.Checkbox &&
      createQuestionDto.type !== FieldType.Radio
    ) {
      throw new BadRequestException(
        `'choices' property was found but is not appropriate for a ${createQuestionDto.type} field.`,
      )
    }

    // Multiple is only appropriate for Dropdown, Checkbox, and File Upload fields.
    if (
      typeof createQuestionDto.multiple !== 'undefined' &&
      createQuestionDto.type !== FieldType.Dropdown &&
      createQuestionDto.type !== FieldType.Checkbox &&
      createQuestionDto.type !== FieldType.FileInput
    ) {
      throw new BadRequestException(
        `'multiple' property was found but is not appropriate for a ${createQuestionDto.type} field.`,
      )
    }

    // You cannot have multiple choices without literally having multiple choices.
    if (
      typeof createQuestionDto.choices !== 'undefined' &&
      typeof createQuestionDto.multiple !== 'undefined' &&
      createQuestionDto.choices.length === 1
    ) {
      throw new BadRequestException(`There cannot be only one choice and multiple allowable selections.`)
    }

    // FileMaxCount is only for FileInput fields.
    if (typeof createQuestionDto.fileMaxCount !== 'undefined' && createQuestionDto.type !== FieldType.FileInput) {
      throw new BadRequestException(
        `'fileMaxCount' property was found but is not appropriate for a ${createQuestionDto.type} field.`,
      )
    }

    // FileTypes is only for FileInput fields.
    if (typeof createQuestionDto.fileTypes !== 'undefined' && createQuestionDto.type !== FieldType.FileInput) {
      throw new BadRequestException(
        `'fileTypes' property was found but is not appropriate for a ${createQuestionDto.type} field.`,
      )
    }

    // FileMaxSize is only for FileInput fields.
    if (typeof createQuestionDto.fileMaxSize !== 'undefined' && createQuestionDto.type !== FieldType.FileInput) {
      throw new BadRequestException(
        `'fileMaxSize' property was found but is not appropriate for a ${createQuestionDto.type} field.`,
      )
    }

    // This is being saved in a relation by the required formId property.
    return this.questionRepository.save(question)
  }

  findOne(id: number): Promise<Question> {
    return this.questionRepository.findOne(id)
  }

  findByForm(id: number): Promise<Question[]> {
    return this.questionRepository.find({ formId: id })
  }

  /**
   * Updates a question's attributes.
   * @param id Question uuid.
   * @param updateQuestionDto
   */
  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionRepository.findOneOrFail(id)
    const currentPos = question.order
    const desiredPos = updateQuestionDto.order

    // Choices is only appropriate for Dropdown, Checkbox, and Radio fields.
    if (
      typeof updateQuestionDto.choices !== 'undefined' &&
      question.type !== FieldType.Dropdown &&
      question.type !== FieldType.Checkbox &&
      question.type !== FieldType.Radio
    ) {
      throw new BadRequestException(`'choices' property was found but is not appropriate for a ${question.type} field.`)
    }

    // Multiple is only appropriate for Dropdown, Checkbox, and File Upload fields.
    if (
      typeof updateQuestionDto.multiple !== 'undefined' &&
      question.type !== FieldType.Dropdown &&
      question.type !== FieldType.Checkbox &&
      question.type !== FieldType.FileInput
    ) {
      throw new BadRequestException(
        `'multiple' property was found but is not appropriate for a ${question.type} field.`,
      )
    }

    // You cannot have multiple choices without literally having multiple choices.
    if (
      typeof updateQuestionDto.choices !== 'undefined' &&
      typeof updateQuestionDto.multiple !== 'undefined' &&
      updateQuestionDto.choices.length === 1
    ) {
      throw new BadRequestException(`There cannot be only one choice and multiple allowable selections.`)
    }

    // FileMaxCount is only for FileInput fields.
    if (typeof updateQuestionDto.fileMaxCount !== 'undefined' && question.type !== FieldType.FileInput) {
      throw new BadRequestException(
        `'fileMaxCount' property was found but is not appropriate for a ${question.type} field.`,
      )
    }

    // FileTypes is only for FileInput fields.
    if (typeof updateQuestionDto.fileTypes !== 'undefined' && question.type !== FieldType.FileInput) {
      throw new BadRequestException(
        `'fileTypes' property was found but is not appropriate for a ${question.type} field.`,
      )
    }

    // FileMaxSize is only for FileInput fields.
    if (typeof updateQuestionDto.fileMaxSize !== 'undefined' && question.type !== FieldType.FileInput) {
      throw new BadRequestException(
        `'fileMaxSize' property was found but is not appropriate for a ${question.type} field.`,
      )
    }

    if (desiredPos && currentPos !== desiredPos) {
      const move = updateQuestionDto.order > question.order ? 'down' : 'up'

      await this.questionRepository.manager.transaction(async () => {
        question.order = 0
        await question.save()

        // Decrement items between the current position and the desired position.
        if (move === 'down') {
          await this.questionRepository.decrement({ order: Between(currentPos + 1, desiredPos) }, 'order', 1)
        }

        // Increment items from desired position and the current position.
        if (move === 'up') {
          await this.questionRepository.increment({ order: Between(desiredPos, currentPos - 1) }, 'order', 1)
        }
      })
    }

    this.questionRepository.merge(question, updateQuestionDto)

    return this.questionRepository.save(question)
  }

  /**
   * Deletes a question by soft deletion if there are any submissions present.
   * @param id Question uuid.
   */
  async delete(id: string): Promise<Question> {
    // TODO: Update this to scan for submissions or not.
    const question = await this.questionRepository.findOneOrFail(id)

    return this.questionRepository.remove(question)
  }
}
