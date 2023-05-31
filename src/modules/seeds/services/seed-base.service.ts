import { AbstractEntity } from 'src/common/models/abstract.entity';
import { Repository } from 'typeorm';

export abstract class SeedBaseService<E extends AbstractEntity> {
  constructor(private repository: Repository<E>) {}

  getRepository(): Repository<E> {
    return this.repository;
  }

  public abstract run(): Promise<void>;
}
