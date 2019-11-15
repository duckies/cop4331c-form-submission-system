import { FormService } from './form.service';
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Form } from './form.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { UpdateFormDto } from './dto/update-form.dto';

describe('FormService', () => {
  let formService: FormService;
  let formRepository: Repository<Form>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FormService,
        {
          provide: getRepositoryToken(Form),
          useClass: Repository,
        },
      ],
    }).compile();

    formService = module.get<FormService>(FormService);
    formRepository = module.get<Repository<Form>>(getRepositoryToken(Form));
  });

  it('should be defined', () => {
    expect(formService).toBeDefined();
  });

  it('should return for create()', async () => {
    const form = new Form();
    form.id = 1;
    form.title = 'Some Awesome Form';
    form.description = 'Form Description';

    jest.spyOn(formRepository, 'merge').mockResolvedValueOnce(form as never);
    jest.spyOn(formRepository, 'save').mockImplementation(async (form: Form) => form);

    expect(await formService.create(new User(), { title: 'blank' })).toEqual(form);
  });

  it('should return for findOne()', async () => {
    const form = new Form();
    form.id = 1;
    form.title = 'Some Awesome Form';
    form.description = 'Form Description';

    jest.spyOn(formRepository, 'findOneOrFail').mockResolvedValueOnce(form);

    expect(await formService.findOne(1)).toEqual(form);
  });

  it('should return for update()', async () => {
    const form = new Form();
    form.id = 1;
    form.title = 'Some Awesome Form';
    form.description = 'Form Description';

    jest.spyOn(formRepository, 'findOneOrFail').mockResolvedValueOnce(form);
    jest.spyOn(formRepository, 'merge').mockResolvedValueOnce(form as never);
    jest.spyOn(formRepository, 'save').mockResolvedValueOnce(form);

    expect(await formService.update(1, new UpdateFormDto())).toEqual(form);
  });

  it('should return for delete()', async () => {
    const form = new Form();
    form.id = 1;
    form.title = 'Some Awesome Form';
    form.description = 'Form Description';

    jest.spyOn(formRepository, 'findOneOrFail').mockResolvedValueOnce(form);
    jest.spyOn(formRepository, 'remove').mockResolvedValueOnce(form);

    expect(await formService.delete(1)).toEqual(form);
  });
});
