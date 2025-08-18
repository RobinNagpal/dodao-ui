'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCaseStudyById, getModuleById, getExercisesByModuleId } from '@/dummy/mockData';
import { CaseStudy, CaseStudyModule, ModuleExercise } from '@/types';

export default function ModuleOverview() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [module, setModule] = useState<CaseStudyModule | null>(null);
  const [exercises, setExercises] = useState<ModuleExercise[]>([]);
  const router = useRouter();
  const params = useParams();
  const caseStudyId = params.caseStudyId as string;
  const moduleId = params.moduleId as string;

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'student' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);

    // Load data
    const studyData = getCaseStudyById(caseStudyId);
    const moduleData = getModuleById(moduleId);

    if (!studyData || !moduleData) {
      router.push('/student');
      return;
    }

    setCaseStudy(studyData);
    setModule(moduleData);
    setExercises(getExercisesByModuleId(moduleId));
    setIsLoading(false);
  }, [router, caseStudyId, moduleId]);

  const handleExerciseSelect = (exercise: ModuleExercise) => {
    router.push(`/student/case-study/${caseStudyId}/module/${moduleId}/exercise/${exercise.id}`);
  };

  const handleBack = () => {
    router.push(`/student/case-study/${caseStudyId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!caseStudy || !module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Module not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className="text-gray-600 hover:text-gray-900 transition-colors">
                ← Back to Case Study
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
                <p className="text-gray-600">{caseStudy.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">Module {module.orderNumber}</span>
            <h2 className="text-xl font-semibold text-gray-900">{module.title}</h2>
            {module.createdBy ? (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">by {module.createdBy}</span>
            ) : (
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded">Predefined</span>
            )}
          </div>
          <p className="text-gray-700 mb-4">{module.shortDescription}</p>
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-gray-800">{module.details}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Exercises</h2>
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500"
                onClick={() => handleExerciseSelect(exercise)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">Exercise {exercise.orderNumber}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
                    </div>
                    <p className="text-gray-600 mt-2">{exercise.shortDescription}</p>
                  </div>
                  <div className="text-green-600 font-medium">Start →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
