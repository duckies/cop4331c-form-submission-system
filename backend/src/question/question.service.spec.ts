import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateQuestionDto } from './dto/create-question.dto'
import { FieldType, Question } from './question.entity'
import { QuestionService } from './question.service'
import { UpdateQuestionDto } from './dto/update-question.dto'

describe('QuestionService', () => {
  let questionService: QuestionService
  let questionRepository: Repository<Question>

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getRepositoryToken(Question),
          useClass: Repository,
        },
      ],
    }).compile()

    questionService = module.get<QuestionService>(QuestionService)
    questionRepository = module.get<Repository<Question>>(getRepositoryToken(Question))
  })

  it('should be defined', () => {
    expect(questionService).toBeDefined()
  })

  it('should throw when choices is not appropriate in create()', async () => {
    const dto = new CreateQuestionDto()
    dto.choices = ['Some selection option']
    dto.type = FieldType.TextArea

    jest.spyOn(questionRepository, 'merge').mockResolvedValueOnce(dto as never)

    expect.assertions(1)

    try {
      await questionService.create(dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'choices' property was found but is not appropriate for a TextArea field.",
        },
      })
    }
  })

  it('should throw when multiple is not appropriate', async () => {
    const dto = new CreateQuestionDto()
    dto.multiple = true
    dto.type = FieldType.TextArea

    jest.spyOn(questionRepository, 'merge').mockResolvedValueOnce(dto as never)

    expect.assertions(1)

    try {
      await questionService.create(dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'multiple' property was found but is not appropriate for a TextArea field.",
        },
      })
    }
  })

  it('should throw when multiple and choices do not make sense', async () => {
    const dto = new CreateQuestionDto()
    dto.multiple = true
    dto.choices = ['One Choice']
    dto.type = FieldType.Dropdown

    jest.spyOn(questionRepository, 'merge').mockResolvedValueOnce(dto as never)

    expect.assertions(1)

    try {
      await questionService.create(dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: 'There cannot be only one choice and multiple allowable selections.',
        },
      })
    }
  })

  it('should throw when fileMaxCount is not appropriate', async () => {
    const dto = new CreateQuestionDto()
    dto.fileMaxCount = 3
    dto.type = FieldType.TextArea

    jest.spyOn(questionRepository, 'merge').mockResolvedValueOnce(dto as never)

    expect.assertions(1)

    try {
      await questionService.create(dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'fileMaxCount' property was found but is not appropriate for a TextArea field.",
        },
      })
    }
  })

  it('should throw when fileTypes is not appropriate', async () => {
    const dto = new CreateQuestionDto()
    dto.required = true
    dto.fileTypes = ['pdf']
    dto.type = FieldType.TextArea

    jest.spyOn(questionRepository, 'merge').mockResolvedValueOnce(dto as never)

    expect.assertions(1)

    try {
      await questionService.create(dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'fileTypes' property was found but is not appropriate for a TextArea field.",
        },
      })
    }
  })

  it('should throw when fileMaxSize is not appropriate', async () => {
    const dto = new CreateQuestionDto()
    dto.required = true
    dto.fileMaxSize = 10
    dto.type = FieldType.TextArea

    jest.spyOn(questionRepository, 'merge').mockResolvedValueOnce(dto as never)

    expect.assertions(1)

    try {
      await questionService.create(dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'fileMaxSize' property was found but is not appropriate for a TextArea field.",
        },
      })
    }
  })

  it('should return a question on create()', async () => {
    const dto = new CreateQuestionDto()
    dto.type = FieldType.TextArea
    const question = new Question()

    jest.spyOn(questionRepository, 'merge').mockResolvedValueOnce(question as never)
    jest.spyOn(questionRepository, 'save').mockResolvedValueOnce(question as never)

    expect(await questionService.create(dto)).toEqual(question)
  })

  it('should return a question on findOne()', async () => {
    const question = new Question()

    jest.spyOn(questionRepository, 'findOne').mockResolvedValueOnce(question as never)

    expect(await questionService.findOne(null)).toEqual(question)
  })

  it('should return an array of questions on findByForm()', async () => {
    const questions = [new Question()]

    jest.spyOn(questionRepository, 'find').mockResolvedValueOnce(questions as never)

    expect(await questionService.findByForm(null)).toEqual(questions)
  })

  it('should return a question on update()', async () => {
    const question = new Question()
    question.type = FieldType.TextArea

    jest.spyOn(questionRepository, 'merge').mockResolvedValueOnce(question as never)
    jest.spyOn(questionRepository, 'findOneOrFail').mockImplementation(async () => question)
    jest.spyOn(questionRepository, 'save').mockResolvedValueOnce(question)

    expect(await questionService.create(new CreateQuestionDto())).toEqual(question)
  })

  it('should throw if choices is not appropriate for update()', async () => {
    const question = new Question()
    question.type = FieldType.TextInput
    question.order = 1

    const dto = new UpdateQuestionDto()
    dto.choices = ['Something to choose.']
    dto.order = 1

    jest.spyOn(questionRepository, 'merge').mockImplementation(() => null)
    jest.spyOn(questionRepository, 'findOneOrFail').mockImplementation(async () => question)
    jest.spyOn(questionRepository, 'save').mockResolvedValueOnce(question)

    expect.assertions(1)
    try {
      await questionService.update(null, dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'choices' property was found but is not appropriate for a TextInput field.",
        },
      })
    }
  })

  it('should throw if multiple is not appropriate for update()', async () => {
    const question = new Question()
    question.type = FieldType.TextInput
    question.order = 1

    const dto = new UpdateQuestionDto()
    dto.multiple = true
    dto.order = 1

    jest.spyOn(questionRepository, 'merge').mockImplementation(() => null)
    jest.spyOn(questionRepository, 'findOneOrFail').mockImplementation(async () => question)
    jest.spyOn(questionRepository, 'save').mockResolvedValueOnce(question)

    expect.assertions(1)
    try {
      await questionService.update(null, dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'multiple' property was found but is not appropriate for a TextInput field.",
        },
      })
    }
  })

  it('should throw if fileTypes is not appropriate for update()', async () => {
    const question = new Question()
    question.type = FieldType.TextInput
    question.order = 1

    const dto = new UpdateQuestionDto()
    dto.fileTypes = ['pdf']

    jest.spyOn(questionRepository, 'merge').mockImplementation(() => null)
    jest.spyOn(questionRepository, 'findOneOrFail').mockImplementation(async () => question)
    jest.spyOn(questionRepository, 'save').mockResolvedValueOnce(question)

    expect.assertions(1)
    try {
      await questionService.update(null, dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'fileTypes' property was found but is not appropriate for a TextInput field.",
        },
      })
    }
  })

  it('should throw if fileMaxCount is not appropriate for update()', async () => {
    const question = new Question()
    question.type = FieldType.TextInput
    question.order = 1

    const dto = new UpdateQuestionDto()
    dto.fileMaxSize = 10

    jest.spyOn(questionRepository, 'merge').mockImplementation(() => null)
    jest.spyOn(questionRepository, 'findOneOrFail').mockImplementation(async () => question)
    jest.spyOn(questionRepository, 'save').mockResolvedValueOnce(question)

    expect.assertions(1)
    try {
      await questionService.update(null, dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'fileMaxSize' property was found but is not appropriate for a TextInput field.",
        },
      })
    }
  })

  it('should throw if fileMaxSize is not appropriate for update()', async () => {
    const question = new Question()
    question.type = FieldType.TextInput
    question.order = 1

    const dto = new UpdateQuestionDto()
    dto.fileMaxCount = 3

    jest.spyOn(questionRepository, 'merge').mockImplementation(() => null)
    jest.spyOn(questionRepository, 'findOneOrFail').mockImplementation(async () => question)
    jest.spyOn(questionRepository, 'save').mockResolvedValueOnce(question)

    expect.assertions(1)
    try {
      await questionService.update(null, dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: "'fileMaxCount' property was found but is not appropriate for a TextInput field.",
        },
      })
    }
  })

  it('should throw if multiple and choices does not make sense for update()', async () => {
    const question = new Question()
    question.type = FieldType.Dropdown
    question.order = 1

    const dto = new UpdateQuestionDto()
    dto.multiple = true
    dto.choices = ['Some singular choice.']
    dto.order = 1

    jest.spyOn(questionRepository, 'merge').mockImplementation(() => null)
    jest.spyOn(questionRepository, 'findOneOrFail').mockImplementation(async () => question)
    jest.spyOn(questionRepository, 'save').mockResolvedValueOnce(question)

    expect.assertions(1)
    try {
      await questionService.update(null, dto)
    } catch (error) {
      expect(error).toMatchObject({
        message: {
          statusCode: 400,
          message: 'There cannot be only one choice and multiple allowable selections.',
        },
      })
    }
  })

  it('should return a question on delete()', async () => {
    const question = new Question()

    jest.spyOn(questionRepository, 'findOneOrFail').mockImplementation(async () => question)
    jest.spyOn(questionRepository, 'remove').mockResolvedValueOnce(question)

    expect(await questionService.delete(null)).toEqual(question)
  })
})
