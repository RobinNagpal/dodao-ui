'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, TrendingUp, DollarSign, Truck, BarChart3, LogOut, Play, CheckCircle, Clock, Lock } from 'lucide-react';
import { CaseStudy } from '@/types';

interface CourseData {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  caseStudies: CaseStudy[];
}

interface CourseDashboardProps {
  studentEmail: string;
  onCaseStudySelect: (caseStudy: CaseStudy) => void;
  onLogout: () => void;
}

export function CourseDashboard({ studentEmail, onCaseStudySelect, onLogout }: CourseDashboardProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('marketing');

  const courses: CourseData[] = [
    {
      id: 'marketing',
      name: 'Marketing',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-blue-500',
      caseStudies: [
        {
          id: 'allbirds-new-category',
          title: 'Allbirds - Entering New Shoe Category',
          company: 'Allbirds',
          description: 'Learn how an established sustainable brand launches performance running shoes using 4Cs, STP, and 4Ps frameworks.',
          difficulty: 'Intermediate',
          duration: '2-3 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: true,
          assignedBy: 'Prof. Sarah Martinez',
          assignedDate: 'Jan 15, 2024',
        },
        {
          id: 'nike-digital-transformation',
          title: 'Nike - Digital Marketing Revolution',
          company: 'Nike',
          description: "Analyze Nike's shift to direct-to-consumer digital strategy and personalized marketing campaigns.",
          difficulty: 'Advanced',
          duration: '3-4 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
        {
          id: 'startup-brand-building',
          title: 'Startup Brand Building from Zero',
          company: 'Generic Startup',
          description: 'Build a complete brand strategy for a new sustainable tech startup entering the market.',
          difficulty: 'Beginner',
          duration: '1-2 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: true,
          assignedBy: 'Prof. Michael Chen',
          assignedDate: 'Jan 12, 2024',
        },
      ],
    },
    {
      id: 'hr',
      name: 'Human Resources',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-green-500',
      caseStudies: [
        {
          id: 'google-culture-change',
          title: 'Google - Managing Cultural Transformation',
          company: 'Google',
          description: 'Examine how Google maintains its innovative culture while scaling globally and managing diverse teams.',
          difficulty: 'Advanced',
          duration: '2-3 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
        {
          id: 'remote-work-policies',
          title: 'Building Effective Remote Work Policies',
          company: 'Multiple Companies',
          description: 'Design comprehensive remote work policies that balance productivity, culture, and employee satisfaction.',
          difficulty: 'Intermediate',
          duration: '1-2 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: true,
          assignedBy: 'Prof. Lisa Wang',
          assignedDate: 'Jan 10, 2024',
        },
      ],
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-emerald-500',
      caseStudies: [
        {
          id: 'startup-funding-strategy',
          title: 'Startup Funding Strategy & Valuation',
          company: 'Tech Startup',
          description: 'Navigate through seed funding, Series A preparation, and investor pitch development with financial modeling.',
          difficulty: 'Advanced',
          duration: '3-4 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
        {
          id: 'corporate-budgeting',
          title: 'Corporate Budget Planning & Analysis',
          company: 'Fortune 500',
          description: 'Learn advanced budgeting techniques, variance analysis, and financial forecasting for large corporations.',
          difficulty: 'Intermediate',
          duration: '2-3 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
      ],
    },
    {
      id: 'operations',
      name: 'Operations',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-purple-500',
      caseStudies: [
        {
          id: 'amazon-logistics-optimization',
          title: 'Amazon - Logistics & Supply Chain Optimization',
          company: 'Amazon',
          description: "Analyze Amazon's logistics network and develop strategies for last-mile delivery optimization.",
          difficulty: 'Advanced',
          duration: '3-4 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
        {
          id: 'manufacturing-efficiency',
          title: 'Manufacturing Process Improvement',
          company: 'Manufacturing Corp',
          description: 'Apply lean manufacturing principles and Six Sigma methodologies to improve production efficiency.',
          difficulty: 'Intermediate',
          duration: '2-3 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
      ],
    },
    {
      id: 'supply-management',
      name: 'Supply Management',
      icon: <Truck className="h-5 w-5" />,
      color: 'bg-orange-500',
      caseStudies: [
        {
          id: 'walmart-supplier-relations',
          title: 'Walmart - Strategic Supplier Relationship Management',
          company: 'Walmart',
          description: "Examine Walmart's supplier management strategies and develop frameworks for vendor evaluation and partnership.",
          difficulty: 'Advanced',
          duration: '2-3 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
        {
          id: 'sustainable-sourcing',
          title: 'Sustainable Sourcing & Procurement',
          company: 'Multiple Companies',
          description: 'Design sustainable procurement strategies that balance cost, quality, and environmental responsibility.',
          difficulty: 'Intermediate',
          duration: '2 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
      ],
    },
    {
      id: 'economics',
      name: 'Economics',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-red-500',
      caseStudies: [
        {
          id: 'market-analysis-competition',
          title: 'Market Structure & Competitive Analysis',
          company: 'Various Industries',
          description: 'Analyze different market structures and develop competitive strategies using economic principles and game theory.',
          difficulty: 'Advanced',
          duration: '3-4 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
        {
          id: 'pricing-strategy-economics',
          title: 'Economic Principles in Pricing Strategy',
          company: 'Multiple Sectors',
          description: 'Apply microeconomic principles to develop optimal pricing strategies across different market conditions.',
          difficulty: 'Intermediate',
          duration: '2-3 hours',
          progress: 0,
          status: 'not-started',
          isAssigned: false,
        },
      ],
    },
  ];

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);

  const getStatusIcon = (caseStudy: CaseStudy) => {
    if (!caseStudy.isAssigned) {
      return <Lock className="h-4 w-4 text-gray-400" />;
    }
    switch (caseStudy.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (caseStudy: CaseStudy) => {
    if (!caseStudy.isAssigned) {
      return 'bg-gray-100 text-gray-800';
    }
    switch (caseStudy.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: CaseStudy['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">GenAI Simulations</h1>
              <Badge variant="secondary">Student Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {studentEmail}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Course Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Courses</CardTitle>
                <CardDescription>Select a course to view case studies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      selectedCourse === course.id ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${course.color} text-white`}>{course.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{course.name}</div>
                      <div className="text-sm text-gray-500">{course.caseStudies.length} case studies</div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Case Studies Grid */}
          <div className="col-span-9">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourseData?.name} Case Studies</h2>
              <p className="text-gray-600">Guided AI-powered simulations on real business case studies assigned by your professors.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedCourseData?.caseStudies.map((caseStudy) => (
                <Card key={caseStudy.id} className={`transition-shadow ${caseStudy.isAssigned ? 'hover:shadow-lg' : 'opacity-75'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 flex items-center space-x-2">
                          <span>{caseStudy.title}</span>
                          {!caseStudy.isAssigned && <Lock className="h-4 w-4 text-gray-400" />}
                        </CardTitle>
                        <CardDescription className="text-sm mb-3">{caseStudy.description}</CardDescription>
                      </div>
                      {getStatusIcon(caseStudy)}
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {caseStudy.company}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(caseStudy.difficulty)}`}>{caseStudy.difficulty}</Badge>
                      <Badge className={`text-xs ${getStatusColor(caseStudy)}`}>
                        {caseStudy.isAssigned ? caseStudy.status?.replace('-', ' ') || 'not started' : 'locked'}
                      </Badge>
                    </div>

                    {caseStudy.isAssigned && (
                      <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Assigned by:</strong> {caseStudy.assignedBy}
                        </p>
                        <p className="text-xs text-blue-600">Assigned on {caseStudy.assignedDate}</p>
                      </div>
                    )}

                    {(caseStudy.progress || 0) > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{caseStudy.progress || 0}%</span>
                        </div>
                        <Progress value={caseStudy.progress || 0} className="h-2" />
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <div>{caseStudy.duration}</div>
                      </div>
                      <Button onClick={() => onCaseStudySelect(caseStudy)} className="bg-blue-600 hover:bg-blue-700" disabled={!caseStudy.isAssigned}>
                        {!caseStudy.isAssigned ? 'Not Assigned' : caseStudy.status === 'not-started' ? 'Start Case' : 'Continue'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
