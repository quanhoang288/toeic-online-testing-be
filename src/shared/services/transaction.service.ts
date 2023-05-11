import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectDataSource()
    private readonly appDataSource: DataSource,
  ) {}

  private queryRunner: QueryRunner;

  public async runInTransaction(
    execFunc: (queryRunner: QueryRunner) => Promise<void>,
  ): Promise<boolean> {
    if (!this.queryRunner || this.queryRunner.isReleased) {
      this.queryRunner = this.appDataSource.createQueryRunner();
      await this.queryRunner.connect();
    }

    await this.queryRunner.startTransaction();
    try {
      await execFunc(this.queryRunner);

      await this.queryRunner.commitTransaction();
      return true;
    } catch (err) {
      console.log(err);
      // since we have errors lets rollback the changes we made
      await this.queryRunner.rollbackTransaction();
      return false;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await this.queryRunner.release();
    }
  }
}
