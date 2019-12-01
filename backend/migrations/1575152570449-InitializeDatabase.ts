import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitializeDatabase1575152570449 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "question_type_enum" AS ENUM('TextArea', 'TextInput', 'Checkbox', 'Radio', 'Dropdown', 'FileInput')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "question_mimetypes_enum" AS ENUM('application/msword', 'application/vnd.openxmlformats-officedocument', 'application/pdf', 'text/plain', 'any')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "label" character varying, "order" integer NOT NULL, "type" "question_type_enum" NOT NULL, "required" boolean NOT NULL, "choices" text array, "multiple" boolean, "fileMaxCount" integer, "mimeTypes" "question_mimetypes_enum" array, "deleted" boolean NOT NULL, "formId" integer NOT NULL, "answered" boolean NOT NULL DEFAULT false, "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" SERIAL NOT NULL, "formId" integer NOT NULL, "answers" jsonb NOT NULL, "createdOn" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7faa571d0e4a7076e85890c9bd0" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer NOT NULL, "hash" character varying NOT NULL, "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "form" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "inactive" boolean NOT NULL, "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, CONSTRAINT "UQ_af1702acb1ba2b4f40b32a46a38" UNIQUE ("title"), CONSTRAINT "PK_8f72b95aa2f8ba82cf95dc7579e" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "question" ADD CONSTRAINT "FK_e689d342171443bd0faf5df2134" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_6090e1d5cbf3433ffd14e3b53e7" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "form" ADD CONSTRAINT "FK_b88902124c2d19bf10712ed6d08" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO "user" ("id", "hash") VALUES ('1', '$2b$12$a2UeSKoivWlaLJ5CFPPr8umWAT3p0aGPXhGPBFwaAMxnvx53cMG.W')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "form" DROP CONSTRAINT "FK_b88902124c2d19bf10712ed6d08"`, undefined);
    await queryRunner.query(`ALTER TABLE "submission" DROP CONSTRAINT "FK_6090e1d5cbf3433ffd14e3b53e7"`, undefined);
    await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_e689d342171443bd0faf5df2134"`, undefined);
    await queryRunner.query(`DROP TABLE "form"`, undefined);
    await queryRunner.query(`DROP TABLE "user"`, undefined);
    await queryRunner.query(`DROP TABLE "submission"`, undefined);
    await queryRunner.query(`DROP TABLE "question"`, undefined);
    await queryRunner.query(`DROP TYPE "question_mimetypes_enum"`, undefined);
    await queryRunner.query(`DROP TYPE "question_type_enum"`, undefined);
  }
}
