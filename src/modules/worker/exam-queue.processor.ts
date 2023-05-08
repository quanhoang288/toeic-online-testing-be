// import { Injectable, Logger } from '@nestjs/common';
// import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';

// import { QueueNames } from '../../common/constants/queue-names';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ExamEntity } from '../../database/entities/exam.entity';
// import { Repository } from 'typeorm';
// import { QuestionSetService } from '../question/services/question-set.service';
// import { QuestionService } from '../question/services/question.service';
// import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
// import { SectionEntity } from '../../database/entities/section.entity';
// import { ExamSectionEntity } from '../../database/entities/exam-section.entity';

// @Injectable()
// export class ExamQueueProccessor {
//   private readonly logger = new Logger(ExamQueueProccessor.name);

//   constructor(
//     private readonly questionService: QuestionService,
//     private readonly questionSetService: QuestionSetService,
//     @InjectRepository(ExamEntity)
//     private readonly examRepository: Repository<ExamEntity>,
//     @InjectRepository(ExamDetailEntity)
//     private readonly examDetailRepository: Repository<ExamDetailEntity>,
//     @InjectRepository(SectionEntity)
//     private readonly sectionRepository: Repository<SectionEntity>,
//     @InjectRepository(ExamSectionEntity)
//     private readonly examSectionRepository: Repository<ExamSectionEntity>,
//   ) {}

//   @SqsMessageHandler(QueueNames.TEST_QUEUE, false)
//   handleMessage(message: AWS.SQS.Message): void {
//     this.logger.debug(message);
//   }

//   @SqsConsumerEventHandler(QueueNames.TEST_QUEUE, 'processing_error')
//   public onProcessingError(error: Error, message: AWS.SQS.Message): void {
//     this.logger.debug(error);
//     this.logger.debug(message);
//   }
// }
