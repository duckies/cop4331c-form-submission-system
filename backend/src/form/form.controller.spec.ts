import { FormService } from './form.service';
import { Test } from '@nestjs/testing';
import { Form } from './form.entity';
import { User } from '../user/user.entity';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormController } from './form.controller';
import { CreateFormDto } from './dto/create-form.dto';
import { FindFormDto } from './dto/find-form.dto';

jest.mock('./form.service.ts');

describe('FormController', () => {
  let formService: FormService;
  let formController: FormController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [FormService, FormController],
    }).compile();

    formService = module.get<FormService>(FormService);
    formController = module.get<FormController>(FormController);
  });

  it('should be defined', () => {
    expect(formController).toBeDefined();
  });

  it('should return on create()', async () => {
    const user = new User();
    const dto = new CreateFormDto();
    const form = new Form();

    jest.spyOn(formService, 'create').mockResolvedValueOnce(form);

    expect(await formController.create(user, dto)).toEqual(form);
  });

  it('should return on findOne()', async () => {
    const form = new Form();
    const dto = new FindFormDto();
    dto.id = 1;

    jest.spyOn(formService, 'findOne').mockResolvedValueOnce(form);

    expect(await formController.findOne(dto)).toEqual(form);
  });

  it('should return on update()', async () => {
    const form = new Form();
    const dto = new UpdateFormDto();
    const findDto = new FindFormDto();
    findDto.id = 1;

    jest.spyOn(formService, 'update').mockResolvedValueOnce(form);

    expect(await formController.update(findDto, dto)).toEqual(form);
  });

  it('should return on delete()', async () => {
    const form = new Form();
    const dto = new FindFormDto();
    dto.id = 1;

    jest.spyOn(formService, 'delete').mockResolvedValueOnce(form);

    expect(await formController.delete(dto)).toEqual(form);
  });
});
