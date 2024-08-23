import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { rubricId: string } }) {
  const { rubricId } = params;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  if (!userId) {
    console.log('No User id passed');
  }
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
    const selections = await prisma.ratingCellSelection.findMany({
      where: { rubricCell: { rubricId } },
      include: {
        rubricCell: {
          include: {
            level: true,
            criteria: true,
          },
        },
        user: true,
      },
    });

    const criteriaMap = Object.fromEntries(rubric.criterias.map((criterion) => [criterion.id, criterion.title]));
    const criteriaUserScores: Record<string, { [userId: string]: number[] }> = {};
    const userRatingSubmissions: Record<string, { criteriaId: string; score: number; description: string }[]> = {};
    selections.forEach((selection) => {
      const { rubricCell, user } = selection;
      if (!rubricCell || !rubricCell.criteriaId || !rubricCell.level || !user) return;
      const userScores = criteriaUserScores[rubricCell.criteriaId] || {};
      const scores = userScores[user.id] || [];
      scores.push(rubricCell.level.score);
      userScores[user.id] = scores;
      criteriaUserScores[rubricCell.criteriaId] = userScores;
      const userSubmissions = userRatingSubmissions[user.id] || [];
      userSubmissions.push({
        criteriaId: rubricCell.criteriaId,
        score: rubricCell.level.score,
        description: rubricCell.description,
      });
      userRatingSubmissions[user.id] = userSubmissions;
    });

    const averageScores = Object.entries(criteriaUserScores).map(([criteriaId, userScores]) => {
      const userAverages = Object.values(userScores).map((scores) => scores.reduce((sum, score) => sum + score, 0) / scores.length);
      const averageScore = userAverages.length ? userAverages.reduce((sum, avg) => sum + avg, 0) / userAverages.length : 0;
      const scoreDescriptions = rubric.cells
        .filter((cell) => cell.criteriaId === criteriaId)
        .reduce((acc, cell) => {
          acc[cell.level.score] = cell.description;
          return acc;
        }, {} as Record<number, string>);
      const closestScore = Object.keys(scoreDescriptions).reduce((closest, scoreStr) => {
        const score = Number(scoreStr);
        return Math.abs(score - averageScore) < Math.abs(closest - averageScore) ? score : closest;
      }, Number(Object.keys(scoreDescriptions)[0]) || 0);
      const description = scoreDescriptions[closestScore] || 'No description available';
      return {
        criteriaId,
        criteriaName: criteriaMap[criteriaId] || 'Unknown',
        averageScore,
        description,
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
