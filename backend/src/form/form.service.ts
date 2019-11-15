import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { Form } from './form.entity';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormService {
  constructor(@InjectRepository(Form) private readonly formRepository: Repository<Form>) {}

  create(user: User, createFormDto: CreateFormDto): Promise<Form> {
    const form = this.formRepository.merge(new Form(), createFormDto);

    form.inactive = false;
    form.author = user;

    return this.formRepository.save(form);
  }

  /**
   * Retrieves a single form from its id.
   * @param id Form id to lookup.
   */
  findOne(id: number): Promise<Form> {
    return this.formRepository.findOneOrFail(id);
  }

  // TODO: Pagination method for paginating forms if there are quite a lot of them.

  /**
   * Modifies a form's attributes.
   * @param id Form id to update.
   * @param updateFormDto DTO containing the attributes to update.
   */
  async update(id: number, updateFormDto: UpdateFormDto): Promise<Form> {
    const form = await this.formRepository.findOneOrFail(id);

    this.formRepository.merge(form, updateFormDto);

    // The save() method will insert into the database if an id is not present,
    // the find() family of methods always include the id.
    return this.formRepository.save(form);
  }

  /**
   * Deletes a form and all related questions and submissions.
   * @param id Form id to delete.
   */
  async delete(id: number): Promise<Form> {
    const form = await this.formRepository.findOneOrFail(id);

    return this.formRepository.remove(form);
  }
}
