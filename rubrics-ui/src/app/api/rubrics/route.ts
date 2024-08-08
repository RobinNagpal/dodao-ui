import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  const { programId, rubric } = await req.json();
  try {
    await prisma.$transaction(async (tx) => {
      const existingRubric = await tx.rubric.findFirst({
        where: {
          programs: {
            some: {
              programId: programId,
            },
          },
        },
      });

      let rubricId = existingRubric ? existingRubric.id : null;

      if (rubricId) {
        await tx.rubric.update({
          where: { id: rubricId },
          data: {
            name: rubric[0].name,
            summary: rubric[0].summary,
            description: rubric[0].description,
          },
        });

        await tx.rubricCell.deleteMany({
          where: { rubricId },
        });
        await tx.rubricLevel.deleteMany({
          where: { rubricId },
        });
        await tx.rubricCriteria.deleteMany({
          where: { rubricId },
        });
      } else {
        const newRubric = await tx.rubric.create({
          data: {
            name: rubric[0].name,
            summary: rubric[0].summary,
            description: rubric[0].description,
            programs: {
              create: { programId },
            },
          },
        });
        rubricId = newRubric.id;
      }

      const levelIds: { [key: string]: string } = {};

      for (const level of rubric[0].levels) {
        const existingLevel = await tx.rubricLevel.findUnique({
          where: {
            rubricId_columnName: {
              rubricId: rubricId,
              columnName: level.columnName,
            },
          },
        });

        if (existingLevel) {
          await tx.rubricLevel.update({
            where: { id: existingLevel.id },
            data: {
              description: level.description,
              score: level.score,
            },
          });
          levelIds[level.columnName] = existingLevel.id;
        } else {
          const newLevel = await tx.rubricLevel.create({
            data: {
              columnName: level.columnName,
              description: level.description,
              score: level.score,
              rubricId: rubricId,
            },
          });
          levelIds[level.columnName] = newLevel.id;
        }
      }

      for (const subRubric of rubric) {
        const { criteria, levels } = subRubric;

        const existingCriteria = await tx.rubricCriteria.findFirst({
          where: {
            rubricId: rubricId,
            title: criteria,
          },
        });

        let criteriaId = existingCriteria ? existingCriteria.id : null;

        if (criteriaId) {
          await tx.rubricCriteria.update({
            where: { id: criteriaId },
            data: {
              title: criteria,
            },
          });
        } else {
          const newCriteria = await tx.rubricCriteria.create({
            data: {
              title: criteria,
              rubricId: rubricId,
            },
          });
          criteriaId = newCriteria.id;
        }

        for (const level of levels) {
          const existingCell = await tx.rubricCell.findFirst({
            where: {
              rubricId: rubricId,
              criteriaId: criteriaId,
              levelId: levelIds[level.columnName],
            },
          });

          if (existingCell) {
            await tx.rubricCell.update({
              where: { id: existingCell.id },
              data: {
                description: level.description,
              },
            });
          } else {
            await tx.rubricCell.create({
              data: {
                description: level.description,
                levelId: levelIds[level.columnName],
                criteriaId: criteriaId,
                rubricId: rubricId,
              },
            });
          }
        }
      }
    });

    return NextResponse.json({ status: 200, body: rubric });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rubricId = url.searchParams.get('rubricId');

  if (!rubricId) {
    return NextResponse.json({ status: 400, body: 'Missing rubricId' });
  }

  try {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: {
        levels: true,
        criteria: {
          where: { isArchived: false },
        },
        RubricCell: {
          where: { isArchived: false },
        },
        programs: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!rubric) {
      return NextResponse.json({ status: 404, body: 'Rubric not found' });
    }

    if (!rubric.programs || rubric.programs.length === 0) {
      return NextResponse.json({ status: 404, body: 'No associated program found' });
    }

    const ratingHeaders = rubric.levels.map((level) => ({
      id: level.id,
      header: level.columnName,
      score: level.score,
    }));

    const sortedRatingHeaders = ratingHeaders.sort((a: any, b: any) => b.score - a.score);

    const ratingHeaderIndexMap: Record<string, number> = sortedRatingHeaders.reduce((map, header, index) => {
      map[header.id] = index;
      return map;
    }, {} as Record<string, number>);

    const criteriaMap: Record<string, Array<{ cellId: string; description: string | null }>> = rubric.criteria.reduce((acc, criteria) => {
      if (criteria.title) {
        const cellsForCriteria = rubric.RubricCell.filter((cell) => cell.criteriaId === criteria.id)
          .sort((a, b) => {
            const aIndex = ratingHeaderIndexMap[a.levelId!];
            const bIndex = ratingHeaderIndexMap[b.levelId!];
            return aIndex - bIndex;
          })
          .map((cell) => ({ cellId: cell.id, description: cell.description ?? '' }));
        acc[criteria.title] = cellsForCriteria;
      }
      return acc;
    }, {} as Record<string, Array<{ cellId: string; description: string | null }>>);

    const ratingHeadersWithScores = sortedRatingHeaders.map((header) => ({
      header: header.header,
      score: header.score,
    }));

    const programDetails = rubric.programs.map((mapping) => ({
      name: mapping.program.name,
      summary: mapping.program.summary,
    }));

    const formattedRubric = {
      name: rubric.name,
      summary: rubric.summary,
      details: rubric.description,
      rubricId: rubricId,
      criteriaOrder: rubric.criteria.map((criteria) => criteria.title ?? '').filter((title) => title !== ''),
      rubric: criteriaMap,
      ratingHeaders: ratingHeadersWithScores,
      programs: programDetails,
      criteriaIds: Object.fromEntries(rubric.criteria.map((criteria) => [criteria.title, criteria.id]).filter(([title, id]) => title && id)),
    };

    return NextResponse.json({ status: 200, body: formattedRubric });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}

export async function PUT(req: NextRequest) {
  const { criteriaId } = await req.json();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.rubricCriteria.update({
        where: { id: criteriaId },
        data: { isArchived: true },
      });

      await tx.rubricCell.updateMany({
        where: { criteriaId: criteriaId },
        data: { isArchived: true },
      });
    });

    return NextResponse.json({ status: 200, body: { message: 'Criteria and associated cells archived successfully' } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}
// export async function POST(req: NextRequest, res: NextResponse) {
//   const { programId, rubric } = await req.json();

//   try {
//     await prisma.$transaction(async (tx) => {
//       const [rubricData] = rubric;
//       const existingRubric = await tx.rubric.findFirst({
//         where: {
//           programs: {
//             some: {
//               programId: programId,
//             },
//           },
//         },
//       });

//       let rubricId = existingRubric ? existingRubric.id : null;

//       if (rubricId) {
//         await tx.rubric.update({
//           where: { id: rubricId },
//           data: {
//             name: rubric[0].name,
//             summary: rubric[0].summary,
//             description: rubric[0].description,
//           },
//         });

//         await tx.rubricCell.deleteMany({
//           where: { rubricId },
//         });
//         await tx.rubricLevel.deleteMany({
//           where: { rubricId },
//         });
//         await tx.rubricCriteria.deleteMany({
//           where: { rubricId },
//         });
//       }

//       const { id: upsertedRubricId } = await tx.rubric.upsert({
//         where: {
//           id: existingRubric ? existingRubric.id : '',
//         },
//         update: {
//           name: rubricData.name,
//           summary: rubricData.summary,
//           description: rubricData.description,
//         },
//         create: {
//           name: rubricData.name,
//           summary: rubricData.summary,
//           description: rubricData.description,
//           programs: {
//             create: { programId },
//           },
//         },
//       });

//       // Upsert rubric levels
//       const levelIds: { [key: string]: string } = {};

//       for (const level of rubricData.levels) {
//         const { id: levelId } = await tx.rubricLevel.upsert({
//           where: {
//             rubricId_columnName: {
//               rubricId: upsertedRubricId,
//               columnName: level.columnName,
//             },
//           },
//           update: {
//             description: level.description,
//             score: level.score,
//           },
//           create: {
//             columnName: level.columnName,
//             description: level.description,
//             score: level.score,
//             rubricId: upsertedRubricId,
//           },
//         });

//         levelIds[level.columnName] = levelId;
//       }

//       // Upsert rubric criteria and cells
//       for (const subRubric of rubric) {
//         const { criteria, levels } = subRubric;

//         const { id: criteriaId } = await tx.rubricCriteria.upsert({
//           where: {
//             rubricId_title: {
//               rubricId: upsertedRubricId,
//               title: criteria,
//             },
//           },
//           update: {
//             title: criteria,
//           },
//           create: {
//             title: criteria,
//             rubricId: upsertedRubricId,
//           },
//         });

//         for (const level of levels) {
//           await tx.rubricCell.upsert({
//             where: {
//               rubricId_levelId_criteriaId: {
//                 rubricId: upsertedRubricId,
//                 levelId: levelIds[level.columnName],
//                 criteriaId: criteriaId,
//               },
//             },
//             update: {
//               description: level.description,
//             },
//             create: {
//               description: level.description,
//               levelId: levelIds[level.columnName],
//               criteriaId: criteriaId,
//               rubricId: upsertedRubricId,
//             },
//           });
//         }
//       }
//     });

//     return NextResponse.json({ status: 200, body: rubric });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ status: 500, body: 'An error occurred' });
//   }
// }
