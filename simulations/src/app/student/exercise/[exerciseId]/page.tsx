import StudentExerciseClient from './StudentExerciseClient';

interface StudentExercisePageProps {
  params: Promise<{ exerciseId: string }>;
  searchParams: Promise<{ moduleId?: string; caseStudyId?: string }>;
}

export default async function StudentExercisePage({ params, searchParams }: StudentExercisePageProps) {
  const { exerciseId } = await params;
  const { moduleId, caseStudyId } = await searchParams;

  return <StudentExerciseClient exerciseId={exerciseId} moduleId={moduleId} caseStudyId={caseStudyId} />;
}
