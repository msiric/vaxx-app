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
import { Patient } from "./Patient";
import { User } from "./User";

export enum EventType {
  first = "first",
  second = "second",
}

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Generated("increment")
  serial: number;

  @Column({ type: "timestamptz" })
  date: Date;

  @ManyToOne(() => Patient, { onDelete: "CASCADE" })
  @JoinColumn()
  patient: Patient;

  @Column()
  link: string;

  @Column({
    type: "enum",
    enum: EventType,
  })
  type: EventType;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  doctor: User;

  @Column({ default: null })
  identifier: string;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated: Date;
}
