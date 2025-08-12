'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, Play, FileText, ArrowLeft } from 'lucide-react';
import { CaseStudy, StudentProgress } from '@/types';

interface LandingScreenProps {
  onStart: () => void;
  progress: StudentProgress;
  caseStudy?: CaseStudy;
  onBack?: () => void;
}

export function LandingScreen({ onStart, progress, caseStudy, onBack }: LandingScreenProps) {
  const models: {
    id: string;
    name: string;
    description: string;
    exercises: number;
    status: 'current' | 'locked' | 'completed';
    color: string;
  }[] = [
    {
      id: '4cs',
      name: '4Cs of Marketing',
      description: 'Customer, Cost, Convenience, Communication',
      exercises: 5,
      status: 'current',
      color: 'bg-blue-500',
    },
    {
      id: 'stp',
      name: 'STP Model',
      description: 'Segmentation → Targeting → Positioning',
      exercises: 5,
      status: 'locked',
      color: 'bg-green-500',
    },
    {
      id: '4ps',
      name: '4Ps of Marketing',
      description: 'Product, Price, Place, Promotion',
      exercises: 5,
      status: 'locked',
      color: 'bg-purple-500',
    },
  ];

  const handleReadCaseStudy = () => {
    // This will be implemented later - for now just show alert
    alert('Case study PDF viewer will be implemented here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Courses
                </Button>
              )}
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Marketing Simulation</h1>
                <p className="text-sm text-gray-600">Learn 4Cs, STP, and 4Ps through this guided case study</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              GenAI Simulations
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{caseStudy?.title || 'Allbirds – Entering a New Shoe Category'}</CardTitle>
                <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {caseStudy?.description ||
                    'Help Allbirds launch their new performance running shoes using AI-powered marketing frameworks. Work through real-world scenarios step-by-step to build a comprehensive marketing strategy.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Case Study Context</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <strong>Company:</strong> {caseStudy?.company || 'Allbirds'} (established sustainable footwear brand)
                    </div>
                    <div>
                      <strong>Challenge:</strong> Launch performance running shoes
                    </div>
                    <div>
                      <strong>Target:</strong> Eco-conscious athletes and runners
                    </div>
                    <div>
                      <strong>Goal:</strong> Develop complete go-to-market strategy
                    </div>
                    {caseStudy && (
                      <>
                        <div>
                          <strong>Difficulty:</strong> {caseStudy.difficulty}
                        </div>
                        <div>
                          <strong>Duration:</strong> {caseStudy.duration}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Complete Case Study</h4>
                        <p className="text-sm text-gray-600">Read the full case study details and background information</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleReadCaseStudy}>
                      Read Whole Case Study
                    </Button>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button onClick={onStart} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Start Practice
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">Complete all exercises to build your marketing expertise</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Path</CardTitle>
                <CardDescription>Three marketing models in sequence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {models.map((model, index) => (
                  <div key={model.id} className="relative">
                    {index < models.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>}
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          model.status === 'current' ? model.color : model.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        {model.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : model.status === 'locked' ? (
                          <Lock className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-white font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${model.status === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}>{model.name}</h3>
                        <p className={`text-sm ${model.status === 'locked' ? 'text-gray-400' : 'text-gray-600'}`}>{model.description}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant={model.status === 'locked' ? 'secondary' : 'outline'} className="text-xs">
                            {model.exercises} exercises
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Exercises Completed</span>
                    <span className="font-semibold">{progress.completedExercises.length}/15</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.completedExercises.length / 15) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Just getting started</span>
                    <span>Marketing Expert</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
