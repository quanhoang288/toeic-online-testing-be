// import { Connection } from 'typeorm';
// import type { Factory, Seeder } from 'typeorm-seeding';
// import { ExamTypeEntity } from '../entities/exam-type.entity';
// import { SectionEntity } from '../entities/section.entity';
// import _ from 'lodash';

// export default class CreateExamTypesSeed implements Seeder {
//   public async run(factory: Factory, connection: Connection): Promise<void> {
//     const examTypes = [
//       {
//         id: 1,
//         name: 'toeic',
//         readingPoints: 495,
//         listeningPoints: 495,
//         totalPoints: 990,
//         sections: [
//           {
//             name: 'Part 1',
//             numQuestions: 6,
//           },
//           {
//             name: 'Part 2',
//             numQuestions: 25,
//           },
//           {
//             name: 'Part 3',
//             numQuestions: 39,
//           },
//           {
//             name: 'Part 4',
//             numQuestions: 30,
//           },
//           {
//             name: 'Part 5',
//             numQuestions: 30,
//           },
//           {
//             name: 'Part 6',
//             numQuestions: 16,
//           },
//           {
//             name: 'Part 7',
//             numQuestions: 54,
//           },
//         ],
//       },
//     ];

//     const createdExamTypes = await connection
//       .getRepository(ExamTypeEntity)
//       .save(
//         examTypes.map((type) =>
//           _.pick(type, [
//             'name',
//             'readingPoints',
//             'listeningPoints',
//             'totalPoints',
//           ]),
//         ),
//       );

//     await connection.getRepository(SectionEntity).save(
//       examTypes.reduce(
//         (questions, curType, idx) =>
//           questions.concat(
//             curType.sections.map((section) => ({
//               ...section,
//               examTypeId: createdExamTypes[idx].id,
//             })),
//           ),
//         [],
//       ),
//     );
//   }
// }
