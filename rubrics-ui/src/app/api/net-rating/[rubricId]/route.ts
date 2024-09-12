import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { UserRatingSubmission } from '@/types/rubricsTypes/types';

export async function GET(request: Request, { params }: { params: { rubricId: string } }) {
  const { rubricId } = params;
  const userId = new URL(request.url).searchParams.get('userId');
  if (!userId) console.log('No User id passed');

  const [rubric, selections] = await Promise.all([
    prisma.rubric.findUniqueOrThrow({
      where: { id: rubricId },
      include: {
        cells: { where: { isArchived: false }, include: { level: true, ratings: true } },
        criterias: true,
      },
    }),
    prisma.ratingCellSelection.findMany({
      where: { rubricCell: { rubricId } },
      include: { rubricCell: { include: { level: true, criteria: true } }, user: true },
    }),
  ]);

  const criteriaMap = Object.fromEntries(rubric.criterias.map((c) => [c.id, c.title]));
  const scoreData = selections.reduce((acc, { rubricCell, user }) => {
    if (!rubricCell?.criteriaId || !rubricCell.level || !user) return acc;
    const {
      criteriaId,
      level: { score },
      description,
    } = rubricCell;
    if (!acc[criteriaId]) acc[criteriaId] = { scores: {}, descriptions: {} };
    if (!acc[criteriaId].scores[user.id]) acc[criteriaId].scores[user.id] = [];
    acc[criteriaId].scores[user.id].push(score);
    acc[criteriaId].descriptions[score] = description;
    return acc;
  }, {} as Record<string, { scores: Record<string, number[]>; descriptions: Record<number, string> }>);

  const averageScores = Object.entries(scoreData).map(([criteriaId, data]) => {
    const allScores = Object.values(data.scores).flat();
    const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const closestScore = Object.keys(data.descriptions)
      .map(Number)
      .reduce((a, b) => (Math.abs(b - averageScore) < Math.abs(a - averageScore) ? b : a));
    return {
      criteriaId,
      criteriaName: criteriaMap[criteriaId] || 'Unknown',
      averageScore,
      description: data.descriptions[closestScore] || 'No description available',
    };
  });

  const ratingSubmissions = Object.entries(
    selections.reduce((acc, { rubricCell, user, comment }) => {
      if (!rubricCell?.criteriaId || !rubricCell.level || !user) return acc;
      if (!acc[user.id]) acc[user.id] = [];
      acc[user.id].push({
        criteriaId: rubricCell.criteriaId,
        criteriaName: criteriaMap[rubricCell.criteriaId] || 'Unknown',
        score: rubricCell.level.score,
        description: rubricCell.description,
        comment: comment || 'No comment available',
      });
      return acc;
    }, {} as Record<string, UserRatingSubmission[]>)
  ).map(([userId, submissions]) => ({ userId, submissions }));

  return NextResponse.json({ name: rubric.name, summary: rubric.summary, averageScores, ratingSubmissions });
}
