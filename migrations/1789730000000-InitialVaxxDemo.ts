import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialVaxxDemo1789730000000 implements MigrationInterface {
  name = 'InitialVaxxDemo1789730000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TYPE \"public\".\"user_reminders_enum\" AS ENUM('enabled', 'disabled')");
    await queryRunner.query("CREATE TABLE \"user\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"serial\" SERIAL NOT NULL, \"email\" character varying NOT NULL, \"name\" character varying NOT NULL, \"password\" character varying NOT NULL, \"reminders\" \"public\".\"user_reminders_enum\" NOT NULL DEFAULT 'enabled', \"jwtVersion\" integer NOT NULL DEFAULT '0', \"demoExpiresAt\" TIMESTAMP WITH TIME ZONE, \"created\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"updated\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT \"UQ_e12875dfb3b1d92d7d7c5377e22\" UNIQUE (\"email\"), CONSTRAINT \"UQ_065d4d8f3b5adb4a08841eae3c8\" UNIQUE (\"name\"), CONSTRAINT \"PK_cace4a159ff9f2512dd42373760\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TYPE \"public\".\"patient_vaxxed_enum\" AS ENUM('first', 'second')");
    await queryRunner.query("CREATE TYPE \"public\".\"patient_target_enum\" AS ENUM('first', 'second')");
    await queryRunner.query("CREATE TYPE \"public\".\"patient_vaccine_enum\" AS ENUM('moderna', 'astrazeneca', 'pfizer', 'johnson')");
    await queryRunner.query("CREATE TABLE \"patient\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"serial\" SERIAL NOT NULL, \"name\" character varying NOT NULL, \"vaxxed\" \"public\".\"patient_vaxxed_enum\" NOT NULL, \"target\" \"public\".\"patient_target_enum\" NOT NULL, \"vaccine\" \"public\".\"patient_vaccine_enum\" NOT NULL, \"dob\" TIMESTAMP WITH TIME ZONE, \"mbo\" character varying, \"link\" character varying NOT NULL, \"created\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"updated\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"doctorId\" uuid, CONSTRAINT \"PK_8dfa510bb29ad31ab2139fbfb99\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TYPE \"public\".\"event_type_enum\" AS ENUM('first', 'second')");
    await queryRunner.query("CREATE TABLE \"event\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"serial\" SERIAL NOT NULL, \"date\" TIMESTAMP WITH TIME ZONE NOT NULL, \"link\" character varying NOT NULL, \"type\" \"public\".\"event_type_enum\" NOT NULL, \"identifier\" character varying, \"created\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"updated\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"patientId\" uuid, \"doctorId\" uuid, CONSTRAINT \"PK_30c2f3bbaf6d34a55f8ae6e4614\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("ALTER TABLE \"patient\" ADD CONSTRAINT \"FK_3a86118a85d8fed2f3bf0181264\" FOREIGN KEY (\"doctorId\") REFERENCES \"user\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"event\" ADD CONSTRAINT \"FK_b4c0f7512f86ec84042f47e74f6\" FOREIGN KEY (\"patientId\") REFERENCES \"patient\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"event\" ADD CONSTRAINT \"FK_34bea57c8ea56a0862ef6a64d55\" FOREIGN KEY (\"doctorId\") REFERENCES \"user\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"event\" DROP CONSTRAINT \"FK_34bea57c8ea56a0862ef6a64d55\"");
    await queryRunner.query("ALTER TABLE \"event\" DROP CONSTRAINT \"FK_b4c0f7512f86ec84042f47e74f6\"");
    await queryRunner.query("ALTER TABLE \"patient\" DROP CONSTRAINT \"FK_3a86118a85d8fed2f3bf0181264\"");
    await queryRunner.query("DROP TABLE \"event\"");
    await queryRunner.query("DROP TYPE \"public\".\"event_type_enum\"");
    await queryRunner.query("DROP TABLE \"patient\"");
    await queryRunner.query("DROP TYPE \"public\".\"patient_vaccine_enum\"");
    await queryRunner.query("DROP TYPE \"public\".\"patient_target_enum\"");
    await queryRunner.query("DROP TYPE \"public\".\"patient_vaxxed_enum\"");
    await queryRunner.query("DROP TABLE \"user\"");
    await queryRunner.query("DROP TYPE \"public\".\"user_reminders_enum\"");
  }
}
