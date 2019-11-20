import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionService } from '../question/question.service';
import { Submission } from './submission.entity';
import { SubmissionService } from './submission.service';

jest.mock('../question/question.service');

describe('SubmissionService', () => {
  let questionService: QuestionService;
  let submissionService: SubmissionService;
  let submisisonRepository: Repository<Submission>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuestionService,
        SubmissionService,
        {
          provide: getRepositoryToken(Submission),
          useClass: Repository,
        },
      ],
    }).compile();

    questionService = module.get<QuestionService>(QuestionService);
    submissionService = module.get<SubmissionService>(SubmissionService);
    submisisonRepository = module.get<Repository<Submission>>(getRepositoryToken(Submission));
  });

  it('should be defined', () => {
    expect(submisisonRepository).toBeDefined();
  });
});
