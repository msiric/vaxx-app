import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum VaccinatedTimes {
  first = "first",
  second = "second",
}

export enum VaccineType {
  moderna = "moderna",
  astrazeneca = "astrazeneca",
  pfizer = "pfizer",
  johnson = "johnson",
}

@Entity()
export class Patient extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Generated("increment")
  serial: number;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: VaccinatedTimes,
  })
  vaxxed: VaccinatedTimes;

  @Column({
    type: "enum",
    enum: VaccinatedTimes,
  })
  target: VaccinatedTimes;

  @Column({
    type: "enum",
    enum: VaccineType,
  })
  vaccine: VaccineType;

  @Column({ type: "timestamptz", default: null })
  dob: Date;

  @Column({ default: null })
  mbo: string;

  @Column()
  link: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  doctor: User;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated: Date;
}
