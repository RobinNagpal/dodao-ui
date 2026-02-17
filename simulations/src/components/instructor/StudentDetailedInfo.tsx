'use client';

import { AlertCircle, Calendar, CheckCircle, ChevronDown, ChevronRight, Clock, Layers, Target } from 'lucide-react';
import { FC } from 'react';
import { CaseStudyWithRelationsForInstructor, StudentDetailResponse } from '@/types/api';

interface StudentDetailedInfoProps {
  caseStudyData: CaseStudyWithRelationsForInstructor | null;
  studentDetails: StudentDetailResponse | null;
  expandedModules: Set<string>;
  onToggleModule: (moduleId: string) => void;
  onAttemptClick: (attemptId: string) => void;
}

const StudentDetailedInfo: FC<StudentDetailedInfoProps> = ({ caseStudyData, studentDetails, expandedModules, onToggleModule, onAttemptClick }) => {
  const getStatusIcon = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 rounded-lg mr-2">
          <Layers className="h-5 w-5 text-white" />
        </div>
        Modules & Exercise Attempts
      </h2>

      <div className="space-y-4">
        {caseStudyData?.modules?.map((module) => (
          <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => onToggleModule(module.id)}
              className="w-full bg-gradient-to-br from-gray-50 to-purple-50 p-4 text-left hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium text-center shadow whitespace-nowrap">
                    Module {module.orderNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm whitespace-nowrap">
                    <span className="text-xs text-blue-600 font-medium">Attempted</span>
                    <span className="text-sm font-bold text-blue-900">
                      {(module.exercises || []).filter((exercise) => studentDetails?.attempts.some((attempt) => attempt.exerciseId === exercise.id)).length}
                      {' / '}
                      {(module.exercises || []).length}
                    </span>
                  </div>
                  {expandedModules.has(module.id) ? <ChevronDown className="h-6 w-6 text-gray-600" /> : <ChevronRight className="h-6 w-6 text-gray-600" />}
                </div>
              </div>
            </button>

            {expandedModules.has(module.id) && (
              <div className="p-4 bg-gradient-to-br from-white to-gray-50/50 border-t border-gray-200">
                <div className="space-y-4">
                  {(module.exercises || []).map((exercise) => (
                    <div key={exercise.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium text-center shadow whitespace-nowrap">
                            Exercise {exercise.orderNumber}
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900">{exercise.title}</h5>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-gradient-to-br from-orange-50 to-yellow-50 px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm whitespace-nowrap">
                          <span className="text-xs text-orange-600 font-medium">Attempts</span>
                          <span className="text-sm font-bold text-orange-900">
                            {studentDetails?.attempts.filter((attempt) => attempt.exerciseId === exercise.id).length || 0}
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const exerciseAttempts = studentDetails?.attempts.filter((attempt) => attempt.exerciseId === exercise.id) || [];
                        return exerciseAttempts.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {exerciseAttempts.map((attempt) => (
                              <div key={attempt.id}>
                                <button
                                  onClick={() => onAttemptClick(attempt.id)}
                                  disabled={false}
                                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    attempt.status === 'completed' || attempt.status === 'success'
                                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100'
                                      : attempt.status === 'failed' || attempt.status === 'error'
                                      ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100'
                                      : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:from-yellow-100 hover:to-orange-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center space-x-1.5">
                                      {getStatusIcon(attempt.status)}
                                      <span className="font-medium text-sm">Attempt {attempt.attemptNumber}</span>
                                    </div>
                                    {attempt.evaluatedScore !== null && (
                                      <div className="flex items-center space-x-1">
                                        <Target className="h-3.5 w-3.5 text-blue-600" />
                                        <span className="text-xs font-bold text-blue-900">{attempt.evaluatedScore}/10</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    {attempt.status && (
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(attempt.status)}`}>
                                        {attempt.status}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-gray-500">
                                      {new Date(attempt.createdAt).toLocaleDateString()},{' '}
                                      {new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </button>

                                {attempt.evaluationReasoning && (
                                  <details className="mt-1.5 group">
                                    <summary className="text-[11px] text-blue-600 font-medium cursor-pointer hover:text-blue-800 select-none px-1">
                                      View Evaluation
                                    </summary>
                                    <div className="mt-1 p-2 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800 leading-relaxed max-h-32 overflow-y-auto">
                                      {attempt.evaluationReasoning}
                                    </div>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 text-center shadow-inner">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <h6 className="font-semibold text-gray-700 text-sm">No Attempts Yet</h6>
                            <p className="text-xs text-gray-600">Student hasn’t attempted this exercise</p>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDetailedInfo;
