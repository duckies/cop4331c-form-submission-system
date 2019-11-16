import { MigrationInterface, QueryRunner, getRepository } from 'typeorm'
import { User } from '../src/user/user.entity'

/**
 * This file is invoked the first time the server is initialized in a
 * production, testing, or development environment to create the admin
 * account with the password "admin". The client is expected to use
 * the cli command "setpwd" to change this.
 */

export class SEEDADMINACCOUNT1573859008871 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await getRepository(User).save({
      id: 1,
      hash: '$2b$12$a2UeSKoivWlaLJ5CFPPr8umWAT3p0aGPXhGPBFwaAMxnvx53cMG.W',
    })
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
