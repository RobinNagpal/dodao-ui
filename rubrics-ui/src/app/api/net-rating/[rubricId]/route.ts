import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { rubricId: string } }) {
  const { rubricId } = params;

  try {
    const rubric = await prisma.rubric.findUniqueOrThrow({
      where: { id: rubricId },
      include: {
        cells: {
          where: { isArchived: false },
          include: {
            level: true,
            ratings: true,
          },
        },
        criterias: true,
      },
    });

    const rubricCells = rubric.cells;

    const criteriaMap: Record<string, string> = {};
    rubric.criterias.forEach((criterion) => {
      criteriaMap[criterion.id] = criterion.title;
    });

    const criteriaUserScores: Record<string, Record<string, number[]>> = {};

    rubricCells.forEach((cell) => {
      if (!cell.criteriaId || !cell.level) return;

      const criteria = criteriaUserScores[cell.criteriaId] || {};

      cell.ratings.forEach((rating) => {
        const userId = rating.userId;
        const score = cell.level.score;

        if (!userId || score == null) return;

        const userScores = criteria[userId] || [];
        userScores.push(score);
        criteria[userId] = userScores;
      });

      criteriaUserScores[cell.criteriaId] = criteria;
    });

    const averageScores = Object.entries(criteriaUserScores).map(([criteriaId, userScores]) => {
      const userScoreAverages = Object.values(userScores).map((scores) => {
        return scores.reduce((sum, score) => sum + score) / scores.length;
      });

      const overallAverage = userScoreAverages.length > 0 ? userScoreAverages.reduce((sum, avg) => sum + avg, 0) / userScoreAverages.length : 0;

      return {
        criteriaId,
        criteriaName: criteriaMap[criteriaId] || 'Unknown',
        averageScore: overallAverage,
      };
    });

    const response = {
      name: rubric.name,
      summary: rubric.summary,
      averageScores,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching rubric scores:', error);
    return NextResponse.json({ error: 'Error fetching rubric scores' }, { status: 500 });
  }
}