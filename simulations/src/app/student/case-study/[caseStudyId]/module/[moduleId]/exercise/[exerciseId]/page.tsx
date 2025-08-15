'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCaseStudyById, getModuleById, getExerciseById, getExercisesByModuleId } from '@/data/mockData';
import { CaseStudy, CaseStudyModule, ModuleExercise } from '@/types';

export default function ExercisePage() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [module, setModule] = useState<CaseStudyModule | null>(null);
  const [exercise, setExercise] = useState<ModuleExercise | null>(null);
  const [allExercises, setAllExercises] = useState<ModuleExercise[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const params = useParams();
  const caseStudyId = params.caseStudyId as string;
  const moduleId = params.moduleId as string;
  const exerciseId = params.exerciseId as string;

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
    const exerciseData = getExerciseById(exerciseId);
    const exercisesData = getExercisesByModuleId(moduleId);

    if (!studyData || !moduleData || !exerciseData) {
      router.push('/student');
      return;
    }

    setCaseStudy(studyData);
    setModule(moduleData);
    setExercise(exerciseData);
    setAllExercises(exercisesData);
    setIsLoading(false);
  }, [router, caseStudyId, moduleId, exerciseId]);

  const handleBack = () => {
    router.push(`/student/case-study/${caseStudyId}/module/${moduleId}`);
  };

  const handleNext = () => {
    const currentIndex = allExercises.findIndex((ex) => ex.id === exerciseId);
    if (currentIndex < allExercises.length - 1) {
      const nextExercise = allExercises[currentIndex + 1];
      router.push(`/student/case-study/${caseStudyId}/module/${moduleId}/exercise/${nextExercise.id}`);
    } else {
      // Check if there are more modules
      router.push(`/student/case-study/${caseStudyId}/module/${moduleId}`);
    }
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;

    setIsSubmitting(true);

    // Simulate AI response (in real app, this would call an AI API)
    setTimeout(() => {
      setAiResponse(`This is a simulated AI response to your prompt: "${prompt}". In a real implementation, this would be replaced with actual AI API calls.`);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleSaveAnswer = () => {
    // In real app, save to backend/localStorage
    console.log('Saving answer:', { prompt, aiResponse, finalAnswer });
    // Show success message or move to next
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!caseStudy || !module || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Exercise not found</div>
      </div>
    );
  }

  const currentIndex = allExercises.findIndex((ex) => ex.id === exerciseId);
  const isLastExercise = currentIndex === allExercises.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className="text-gray-600 hover:text-gray-900 transition-colors">
                ← Back to Module
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
                <p className="text-gray-600">
                  {module.title} • {caseStudy.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                Exercise {exercise.orderNumber} of {allExercises.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Instructions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
              <p className="text-gray-800 mb-4">{exercise.shortDescription}</p>
              <div className="bg-blue-50 rounded-md p-4">
                <p className="text-blue-800">{exercise.details}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Workspace */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Prompt</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt for AI here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSubmitPrompt}
                disabled={!prompt.trim() || isSubmitting}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Getting AI Response...' : 'Submit to AI'}
              </button>
            </div>

            {aiResponse && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Response</h3>
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <p className="text-gray-800">{aiResponse}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Final Answer</h3>
              <textarea
                value={finalAnswer}
                onChange={(e) => setFinalAnswer(e.target.value)}
                placeholder="Refine the AI response or add your own insights..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex space-x-3 mt-4">
                <button onClick={handleSaveAnswer} className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                  Save Answer
                </button>
                <button onClick={handleNext} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  {isLastExercise ? 'Complete Module' : 'Next Exercise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
