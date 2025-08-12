'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Users, TrendingUp, DollarSign, Truck, BarChart3, LogOut, Plus, UserPlus, Eye } from 'lucide-react';
import { CaseStudy } from '@/types';

interface ProfessorCaseManagementProps {
  professorEmail: string;
  onLogout: () => void;
  onViewCaseStudy: (caseStudy: CaseStudy) => void;
}

export function ProfessorCaseManagement({ professorEmail, onLogout, onViewCaseStudy }: ProfessorCaseManagementProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('marketing');
  const [studentEmails, setStudentEmails] = useState<string>('');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);

  const courses = [
    { id: 'marketing', name: 'Marketing', icon: <TrendingUp className="h-5 w-5" />, color: 'bg-blue-500' },
    { id: 'hr', name: 'Human Resources', icon: <Users className="h-5 w-5" />, color: 'bg-green-500' },
    { id: 'finance', name: 'Finance', icon: <DollarSign className="h-5 w-5" />, color: 'bg-emerald-500' },
    { id: 'operations', name: 'Operations', icon: <BarChart3 className="h-5 w-5" />, color: 'bg-purple-500' },
    { id: 'supply-management', name: 'Supply Management', icon: <Truck className="h-5 w-5" />, color: 'bg-orange-500' },
    { id: 'economics', name: 'Economics', icon: <BookOpen className="h-5 w-5" />, color: 'bg-red-500' },
  ];

  const predefinedCaseStudies: CaseStudy[] = [
    {
      id: 'allbirds-new-category',
      title: 'Allbirds - Entering New Shoe Category',
      company: 'Allbirds',
      description: 'Learn how an established sustainable brand launches performance running shoes using 4Cs, STP, and 4Ps frameworks.',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      course: 'marketing',
      isActive: true,
      studentsAssigned: ['sarah.j@university.edu', 'michael.c@university.edu', 'emily.r@university.edu'],
      createdDate: 'Jan 15, 2024',
    },
    {
      id: 'nike-digital-transformation',
      title: 'Nike - Digital Marketing Revolution',
      company: 'Nike',
      description: "Analyze Nike's shift to direct-to-consumer digital strategy and personalized marketing campaigns.",
      difficulty: 'Advanced',
      duration: '3-4 hours',
      course: 'marketing',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 10, 2024',
    },
    {
      id: 'startup-brand-building',
      title: 'Startup Brand Building from Zero',
      company: 'Generic Startup',
      description: 'Build a complete brand strategy for a new sustainable tech startup entering the market.',
      difficulty: 'Beginner',
      duration: '1-2 hours',
      course: 'marketing',
      isActive: true,
      studentsAssigned: ['david.k@university.edu', 'jessica.b@university.edu'],
      createdDate: 'Jan 12, 2024',
    },
    {
      id: 'google-culture-change',
      title: 'Google - Managing Cultural Transformation',
      company: 'Google',
      description: 'Examine how Google maintains its innovative culture while scaling globally and managing diverse teams.',
      difficulty: 'Advanced',
      duration: '2-3 hours',
      course: 'hr',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 8, 2024',
    },
    {
      id: 'remote-work-policies',
      title: 'Building Effective Remote Work Policies',
      company: 'Multiple Companies',
      description: 'Design comprehensive remote work policies that balance productivity, culture, and employee satisfaction.',
      difficulty: 'Intermediate',
      duration: '1-2 hours',
      course: 'hr',
      isActive: true,
      studentsAssigned: ['alex.w@university.edu'],
      createdDate: 'Jan 10, 2024',
    },
    {
      id: 'diversity-inclusion-strategy',
      title: 'Building Inclusive Workplace Culture',
      company: 'Tech Startup',
      description: 'Develop comprehensive D&I strategies that create lasting cultural change and improve retention.',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      course: 'hr',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 5, 2024',
    },
    {
      id: 'startup-funding-strategy',
      title: 'Startup Funding & Valuation Strategy',
      company: 'FinTech Startup',
      description: 'Navigate Series A funding rounds, valuation models, and investor relations for growing startups.',
      difficulty: 'Advanced',
      duration: '3-4 hours',
      course: 'finance',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 12, 2024',
    },
    {
      id: 'corporate-budgeting',
      title: 'Corporate Budget Planning & Analysis',
      company: 'Manufacturing Corp',
      description: 'Master budget forecasting, variance analysis, and financial planning for large organizations.',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      course: 'finance',
      isActive: true,
      studentsAssigned: ['finance.student@university.edu'],
      createdDate: 'Jan 8, 2024',
    },
    {
      id: 'investment-portfolio',
      title: 'Investment Portfolio Optimization',
      company: 'Investment Firm',
      description: 'Learn portfolio theory, risk management, and asset allocation strategies for institutional investors.',
      difficulty: 'Advanced',
      duration: '3-4 hours',
      course: 'finance',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 6, 2024',
    },
    {
      id: 'lean-manufacturing',
      title: 'Lean Manufacturing Implementation',
      company: 'Toyota',
      description: 'Implement lean principles to reduce waste, improve efficiency, and optimize production processes.',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      course: 'operations',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 10, 2024',
    },
    {
      id: 'supply-chain-optimization',
      title: 'Global Supply Chain Optimization',
      company: 'Amazon',
      description: 'Optimize complex supply chains for cost, speed, and reliability across global markets.',
      difficulty: 'Advanced',
      duration: '3-4 hours',
      course: 'operations',
      isActive: true,
      studentsAssigned: ['ops.student@university.edu'],
      createdDate: 'Jan 7, 2024',
    },
    {
      id: 'quality-management',
      title: 'Six Sigma Quality Management',
      company: 'General Electric',
      description: 'Apply Six Sigma methodologies to improve process quality and reduce defects.',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      course: 'operations',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 5, 2024',
    },
    {
      id: 'vendor-relationship',
      title: 'Strategic Vendor Relationship Management',
      company: 'Apple',
      description: 'Develop long-term supplier partnerships that drive innovation and cost optimization.',
      difficulty: 'Advanced',
      duration: '3-4 hours',
      course: 'supply-management',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 9, 2024',
    },
    {
      id: 'procurement-strategy',
      title: 'Digital Procurement Transformation',
      company: 'Walmart',
      description: 'Modernize procurement processes using AI, automation, and data analytics.',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      course: 'supply-management',
      isActive: true,
      studentsAssigned: ['supply.student@university.edu'],
      createdDate: 'Jan 6, 2024',
    },
    {
      id: 'sustainable-sourcing',
      title: 'Sustainable Sourcing Strategy',
      company: 'Patagonia',
      description: 'Build ethical supply chains that balance cost, quality, and environmental responsibility.',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      course: 'supply-management',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 4, 2024',
    },
    {
      id: 'market-competition-analysis',
      title: 'Market Competition & Antitrust Analysis',
      company: 'Big Tech',
      description: 'Analyze market concentration, competitive dynamics, and regulatory implications in tech markets.',
      difficulty: 'Advanced',
      duration: '3-4 hours',
      course: 'economics',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 11, 2024',
    },
    {
      id: 'behavioral-economics',
      title: 'Behavioral Economics in Consumer Choice',
      company: 'Netflix',
      description: 'Apply behavioral economics principles to understand and influence consumer decision-making.',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      course: 'economics',
      isActive: true,
      studentsAssigned: ['econ.student@university.edu'],
      createdDate: 'Jan 8, 2024',
    },
    {
      id: 'macroeconomic-policy',
      title: 'Macroeconomic Policy Impact Analysis',
      company: 'Federal Reserve',
      description: 'Evaluate the effects of monetary and fiscal policy on business strategy and market conditions.',
      difficulty: 'Advanced',
      duration: '3-4 hours',
      course: 'economics',
      isActive: false,
      studentsAssigned: [],
      createdDate: 'Jan 3, 2024',
    },
  ];

  const filteredCaseStudies = predefinedCaseStudies.filter((cs) => cs.course === selectedCourse);

  const handleAssignStudents = (caseStudy: CaseStudy) => {
    const emails = studentEmails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email);
    // In a real app, this would make an API call
    console.log(`Assigning case study ${caseStudy.id} to students:`, emails);
    setStudentEmails('');
    setSelectedCaseStudy(null);
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">GenAI Simulations</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Professor Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {professorEmail}</span>
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
                <CardDescription>Select a course to manage case studies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      selectedCourse === course.id ? 'bg-purple-50 border-2 border-purple-200' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${course.color} text-white`}>{course.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{course.name}</div>
                      <div className="text-sm text-gray-500">{predefinedCaseStudies.filter((cs) => cs.course === course.id).length} case studies</div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Case Studies Management */}
          <div className="col-span-9">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{courses.find((c) => c.id === selectedCourse)?.name} Case Studies</h2>
                <p className="text-gray-600">Manage and assign case studies to your students</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Case Study
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCaseStudies.map((caseStudy) => (
                <Card key={caseStudy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{caseStudy.title}</CardTitle>
                        <CardDescription className="text-sm mb-3">{caseStudy.description}</CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {caseStudy.company}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(caseStudy.difficulty)}`}>{caseStudy.difficulty}</Badge>
                      <Badge className={`text-xs ${getStatusColor(caseStudy.isActive ?? false)}`}>{caseStudy.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>

                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Students Assigned:</strong> {caseStudy.studentsAssigned?.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Created: {caseStudy.createdDate}</p>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between space-x-2">
                      <div className="text-sm text-gray-500">
                        <div>{caseStudy.duration}</div>
                      </div>
                      <div className="flex space-x-2">
                        {caseStudy.isActive && (
                          <Button variant="outline" size="sm" onClick={() => onViewCaseStudy(caseStudy)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Monitor
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setSelectedCaseStudy(caseStudy)}>
                              <UserPlus className="h-4 w-4 mr-1" />
                              {caseStudy.isActive ? 'Add Students' : 'Start & Assign'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{caseStudy.isActive ? 'Add Students to Case Study' : 'Start Case Study & Assign Students'}</DialogTitle>
                              <DialogDescription>{caseStudy.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="student-emails">Student Email Addresses</Label>
                                <Textarea
                                  id="student-emails"
                                  placeholder="Enter student emails separated by commas&#10;e.g., student1@university.edu, student2@university.edu"
                                  value={studentEmails}
                                  onChange={(e) => setStudentEmails(e.target.value)}
                                  className="mt-1"
                                  rows={4}
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                              </div>
                              {(caseStudy.studentsAssigned?.length || 0) > 0 && (
                                <div>
                                  <Label>Currently Assigned Students:</Label>
                                  <div className="mt-1 space-y-1">
                                    {caseStudy.studentsAssigned?.map((email, index) => (
                                      <Badge key={index} variant="secondary" className="mr-1">
                                        {email}
                                      </Badge>
                                    )) || null}
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-end space-x-2">
                                <DialogTrigger asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogTrigger>
                                <Button onClick={() => handleAssignStudents(caseStudy)} className="bg-purple-600 hover:bg-purple-700">
                                  {caseStudy.isActive ? 'Add Students' : 'Start & Assign'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
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
