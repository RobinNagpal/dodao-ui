import { Check, Clock, Target } from 'lucide-react';

export interface ExerciseProgress {
  id: string;
  title: string;
  orderNumber: number;
  isCompleted: boolean;
  isAttempted: boolean;
  isCurrent: boolean;
  attemptCount: number;
}

export interface ModuleProgress {
  id: string;
  title: string;
  orderNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  exercises: ExerciseProgress[];
}

export interface ProgressData {
  caseStudyTitle: string;
  caseStudyId: string;
  currentModuleId: string;
  currentExerciseId: string;
  modules: ModuleProgress[];
}

export interface StudentProgressStepperProps {
  progressData: ProgressData;
}

export default function StudentProgressStepper({ progressData }: StudentProgressStepperProps) {
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 sticky top-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Target className="h-5 w-5 text-blue-600 mr-2" />
        Learning Path
      </h3>

      <div className="space-y-6">
        {progressData.modules.map((module) => (
          <div key={module.id} className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${
                    module.isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : module.isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }
                `}
              >
                {module.isCompleted ? <Check className="h-5 w-5" /> : module.orderNumber}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${module.isCompleted ? 'text-green-700' : module.isCurrent ? 'text-blue-700' : 'text-gray-600'}`}>
                  Module {module.orderNumber}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">{module.title}</p>
              </div>
            </div>

            {/* Exercises List */}
            <div className="ml-4 space-y-2 relative">
              {module.exercises.map((exercise) => (
                <div key={exercise.id} className="flex items-start space-x-3 py-1 relative z-10 ">
                  <div
                    className={`
                      w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300
                      ${
                        exercise.isCurrent
                          ? 'bg-blue-500 border-blue-500 ring-2 ring-blue-200'
                          : exercise.isCompleted
                          ? 'bg-green-500 border-green-500'
                          : exercise.isAttempted
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'border-gray-300 bg-white'
                      }
                    `}
                  >
                    {exercise.isCompleted && <Check className="h-3 w-3 text-white" />}
                    {exercise.isAttempted && !exercise.isCompleted && <Clock className="h-2 w-2 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium ${
                        exercise.isCurrent
                          ? 'text-blue-600'
                          : exercise.isCompleted
                          ? 'text-green-600'
                          : exercise.isAttempted
                          ? 'text-yellow-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {exercise.orderNumber}. {exercise.title}
                    </p>
                    {exercise.attemptCount > 0 && <p className="text-xs text-gray-400">{exercise.attemptCount}/3 attempts</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
