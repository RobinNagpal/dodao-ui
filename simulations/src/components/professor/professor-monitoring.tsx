'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, Users, BarChart3, Eye, Clock, CheckCircle, Play, MessageSquare, Bot, ArrowLeft } from 'lucide-react';
import { CaseStudy } from '@/types';

interface ProfessorMonitoringProps {
  professorEmail: string;
  onLogout: () => void;
  selectedCaseStudy?: CaseStudy | null;
  onBack: () => void;
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  currentCaseStudy: string;
  currentExercise: string;
  exerciseProgress: number;
  totalExercises: number;
  lastActive: string;
  status: 'active' | 'idle' | 'completed';
}

interface StudentExerciseDetail {
  studentName: string;
  exerciseTitle: string;
  prompt: string;
  aiResponse: string;
  timestamp: string;
  attemptNumber: number;
}

export function ProfessorMonitoring({ professorEmail, onLogout, selectedCaseStudy, onBack }: ProfessorMonitoringProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // Mock data filtered by selected case study
  const studentData: StudentData[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@university.edu',
      currentCaseStudy: selectedCaseStudy?.title || 'Allbirds - Entering New Shoe Category',
      currentExercise: 'Customer – Identify Top Needs and Wants',
      exerciseProgress: 1,
      totalExercises: 15,
      lastActive: '2 minutes ago',
      status: 'active',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'm.chen@university.edu',
      currentCaseStudy: selectedCaseStudy?.title || 'Allbirds - Entering New Shoe Category',
      currentExercise: 'Cost – Gauge Willingness to Pay',
      exerciseProgress: 2,
      totalExercises: 15,
      lastActive: '15 minutes ago',
      status: 'active',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'e.rodriguez@university.edu',
      currentCaseStudy: selectedCaseStudy?.title || 'Allbirds - Entering New Shoe Category',
      currentExercise: 'Convenience – Map Purchase & Delivery Preferences',
      exerciseProgress: 3,
      totalExercises: 15,
      lastActive: '1 hour ago',
      status: 'idle',
    },
  ];

  const mockExerciseDetails: StudentExerciseDetail[] = [
    {
      studentName: 'Sarah Johnson',
      exerciseTitle: 'Customer – Identify Top Needs and Wants',
      prompt:
        "Using recent market data on eco-friendly footwear, list and briefly explain the top 5 customer needs for Allbirds' upcoming sustainable performance running shoe, ranked by importance.",
      aiResponse:
        "Based on market research and Allbirds' eco-conscious customer base, here are the top 5 customer needs:\n\n1. **All-day comfort & cushioning** - Lightweight, responsive foam that supports long-distance running\n2. **Sustainable materials** - 100% natural or recycled materials (eucalyptus, merino wool, sugarcane)\n3. **Breathability & moisture management** - Advanced ventilation to keep feet dry during intense workouts\n4. **Durability for active use** - Enhanced wear resistance for trails, pavement, and varied terrain\n5. **Versatile style** - Clean, minimalist design that transitions from workout to casual wear",
      timestamp: '2024-01-15 14:30:00',
      attemptNumber: 1,
    },
    {
      studentName: 'Michael Chen',
      exerciseTitle: 'Cost – Gauge Willingness to Pay',
      prompt:
        "Based on competitor pricing and customer surveys, what price range would Allbirds' eco-conscious buyers accept for a new plant-based performance running shoe? Include any premium % for sustainability.",
      aiResponse:
        '**Price Range:** $140-$180\n- Low end: $140 (competitive with mainstream performance shoes)\n- High end: $180 (premium for sustainability + performance)\n\n**Eco-Premium Analysis:**\n- Customers will pay 20-25% more for verified sustainable materials\n- Target demographic (eco-conscious, higher income) supports $160+ price point\n\n**Recommendation:** Launch at $160 to signal premium quality while remaining accessible to core audience.',
      timestamp: '2024-01-15 13:45:00',
      attemptNumber: 2,
    },
  ];

  const getStatusIcon = (status: StudentData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: StudentData['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Case Studies
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Marketing Simulation</h1>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCaseStudy?.title || 'Case Study'} - Student Monitoring</h2>
          <p className="text-gray-600">Track student progress and view their AI interactions in real-time</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.length}</div>
              <p className="text-xs text-muted-foreground">Assigned to this case study</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.filter((s) => s.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">Currently working on exercises</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.filter((s) => s.status === 'completed').length}</div>
              <p className="text-xs text-muted-foreground">Finished the case study</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(studentData.reduce((acc, s) => acc + (s.exerciseProgress / s.totalExercises) * 100, 0) / studentData.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Across all students</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Progress Details</CardTitle>
            <CardDescription>Detailed view of each student's current progress and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Current Exercise</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{student.currentExercise}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>
                            {student.exerciseProgress}/{student.totalExercises}
                          </span>
                          <span>{Math.round((student.exerciseProgress / student.totalExercises) * 100)}%</span>
                        </div>
                        <Progress value={(student.exerciseProgress / student.totalExercises) * 100} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{student.lastActive}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{student.name} - Exercise Details</DialogTitle>
                            <DialogDescription>Current exercise: {student.currentExercise}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {mockExerciseDetails
                              .filter((detail) => detail.studentName === student.name)
                              .map((detail, index) => (
                                <Card key={index}>
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-lg">{detail.exerciseTitle}</CardTitle>
                                      <Badge variant="outline">Attempt {detail.attemptNumber}</Badge>
                                    </div>
                                    <CardDescription>{detail.timestamp}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <div className="flex items-center space-x-2 mb-2">
                                        <MessageSquare className="h-4 w-4 text-blue-600" />
                                        <h4 className="font-medium">Student Prompt:</h4>
                                      </div>
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <p className="text-sm">{detail.prompt}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Bot className="h-4 w-4 text-green-600" />
                                        <h4 className="font-medium">AI Response:</h4>
                                      </div>
                                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <pre className="text-sm whitespace-pre-wrap font-sans">{detail.aiResponse}</pre>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
