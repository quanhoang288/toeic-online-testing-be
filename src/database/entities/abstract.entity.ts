import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractEntity<
  PK extends number = number,
> extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: PK;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
