'use client';

import { Badge } from '@/components/ui/badge';
import { Check, Clock, Lock } from 'lucide-react';
import type { CaseStudyModule, ModuleExercise } from '@/types';

interface CaseStudyStepperProps {
  modules: CaseStudyModule[];
  userType: 'student' | 'instructor' | 'admin';

  // For students - instruction tracking
  hasModuleInstructionsRead?: (moduleId: string) => boolean;

  // For students - exercise tracking
  hasAttempts?: (exercise: any) => boolean;
  getAttemptCount?: (exercise: any) => number;
  isExerciseCompleted?: (exercise: any) => boolean;
  isExerciseAccessible?: (moduleId: string, exerciseId: string) => boolean;

  // Click handlers
  onModuleClick: (module: CaseStudyModule) => void;
  onExerciseClick: (exerciseId: string, moduleId: string) => void;
}

export default function CaseStudyStepper({
  modules,
  userType,
  hasModuleInstructionsRead,
  hasAttempts,
  getAttemptCount,
  isExerciseCompleted,
  isExerciseAccessible,
  onModuleClick,
  onExerciseClick,
}: CaseStudyStepperProps) {
  // For non-students, all modules and exercises are accessible
  const isModuleAccessible = (moduleId: string) => {
    if (userType !== 'student') return true;
    return modules.find((m) => m.id === moduleId)?.exercises?.some((exercise) => isExerciseAccessible?.(moduleId, exercise.id)) || false;
  };

  const isModuleCompleted = (module: CaseStudyModule) => {
    if (userType !== 'student') return false; // No completion tracking for admin/instructor
    return module.exercises?.every((exercise: any) => isExerciseCompleted?.(exercise)) || false;
  };

  const getExerciseState = (exercise: ModuleExercise, moduleId: string) => {
    if (userType === 'student') {
      const exerciseCompleted = isExerciseCompleted?.(exercise) || false;
      const exerciseAttempted = hasAttempts?.(exercise) || false;
      const exerciseAccessible = isExerciseAccessible?.(moduleId, exercise.id) || false;

      return {
        completed: exerciseCompleted,
        attempted: exerciseAttempted,
        accessible: exerciseAccessible,
        attemptCount: getAttemptCount?.(exercise) || 0,
      };
    } else {
      // For admin/instructor, all exercises are accessible, none are tracked as completed
      return {
        completed: false,
        attempted: false,
        accessible: true,
        attemptCount: 0,
      };
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="flex items-start justify-between">
          {modules.map((module, index) => {
            const moduleCompleted = isModuleCompleted(module);
            const moduleAccessible = isModuleAccessible(module.id);

            return (
              <div key={module.id} className="flex flex-col items-center relative flex-1">
                {index < modules.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 z-0">
                    <div
                      className={`h-full transition-all duration-500 ${moduleCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                      style={{ width: moduleCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}

                <div
                  onClick={() => onModuleClick(module)}
                  className={`
                    relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 mb-3 cursor-pointer hover:scale-110
                    ${
                      moduleCompleted
                        ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                        : moduleAccessible
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed hover:scale-100'
                    }
                  `}
                >
                  {moduleCompleted ? <Check className="h-6 w-6" /> : <span className="text-sm font-bold">{module.orderNumber}</span>}
                </div>

                <div className="text-center max-w-40 mb-4">
                  <p className={`text-sm font-medium mb-1 ${moduleCompleted ? 'text-green-700' : moduleAccessible ? 'text-blue-700' : 'text-gray-500'}`}>
                    Module {module.orderNumber}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">{module.title}</p>
                </div>

                <div className="w-full max-w-xs space-y-2">
                  {/* Module Details Card */}
                  <div
                    onClick={() => onModuleClick(module)}
                    className={`
                      flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md
                      ${
                        userType === 'student' && hasModuleInstructionsRead?.(module.id)
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div
                        className={`
                          w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                          ${userType === 'student' && hasModuleInstructionsRead?.(module.id) ? 'bg-green-500 border-green-500' : 'border-blue-500'}
                        `}
                      >
                        {userType === 'student' && hasModuleInstructionsRead?.(module.id) && <Check className="h-3 w-3 text-white" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600 truncate font-medium">📖 Module Instructions</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-2">
                      {userType === 'student' && hasModuleInstructionsRead?.(module.id) && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-1 py-0">✓</Badge>
                      )}
                    </div>
                  </div>

                  {module.exercises && module.exercises.length > 0 && (
                    <div className="space-y-2">
                      {module.exercises.map((exercise) => {
                        const exerciseState = getExerciseState(exercise, module.id);

                        return (
                          <div
                            key={exercise.id}
                            onClick={() => onExerciseClick(exercise.id, module.id)}
                            className={`
                              flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md
                              ${
                                exerciseState.completed
                                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                  : exerciseState.attempted
                                  ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                                  : exerciseState.accessible
                                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                  : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                              }
                            `}
                          >
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <div
                                className={`
                                  w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                                  ${
                                    exerciseState.completed
                                      ? 'bg-green-500 border-green-500'
                                      : exerciseState.attempted
                                      ? 'bg-yellow-500 border-yellow-500'
                                      : exerciseState.accessible
                                      ? 'border-blue-500'
                                      : 'border-gray-300'
                                  }
                                `}
                              >
                                {exerciseState.completed && <Check className="h-3 w-3 text-white" />}
                                {exerciseState.attempted && !exerciseState.completed && <Clock className="h-2 w-2 text-white" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-600 truncate">{`${exercise.orderNumber}) ${exercise.title}`}</p>
                              </div>
                            </div>

                            <div className="flex-shrink-0 ml-2">
                              {exerciseState.completed && <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-1 py-0">✓</Badge>}
                              {exerciseState.attempted && !exerciseState.completed && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-1 py-0">{exerciseState.attemptCount}/3</Badge>
                              )}
                              {!exerciseState.accessible && (
                                <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs px-1 py-0">
                                  <Lock className="h-2 w-2" />
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
