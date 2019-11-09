import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly saltRounds = 12;

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  /**
   * Account creation method for testing purposes.
   * @param password Plaintext password.
   */
  async create(password: string): Promise<User> {
    const hash = await bcrypt.hash(password, this.saltRounds);

    return this.userRepository.save({ hash });
  }

  /**
   * Retrieves a user by their id.
   */
  findOne(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  /**
   * This is an internal method for changing the admin password.
   * Used by command-line only, and not through the API.
   * @param password Plaintext new password.
   */
  async setPassword(password: string): Promise<User> {
    const user = await this.findOne(1);
    const hash = await bcrypt.hash(password, this.saltRounds);

    user.hash = hash;
    return await user.save();
  }

  /**
   * Determines if a plaintext password matches a given hash.
   * @param password Plaintext password.
   * @param hash Password hash.
   */
  async compareHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
