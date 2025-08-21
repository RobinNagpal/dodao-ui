'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Plus, Trash2, X, Sparkles, BookOpen, Target, ArrowLeft } from 'lucide-react';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import type { BusinessSubject } from '@prisma/client';
import type { CreateCaseStudyRequest, CaseStudyWithRelations } from '@/types/api';
import AdminNavbar from '@/components/navigation/AdminNavbar';

interface ModuleFormData {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  exercises: ExerciseFormData[];
}

interface ExerciseFormData {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
}

interface SubjectOption {
  value: BusinessSubject;
  label: string;
}

const subjectOptions: SubjectOption[] = [
  { value: 'HR', label: 'Human Resources' },
  { value: 'ECONOMICS', label: 'Economics' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'OPERATIONS', label: 'Operations' },
];

export default function CreateCaseStudyPage() {
  const router = useRouter();
  const { showNotification } = useNotificationContext();

  // Auth check
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [subject, setSubject] = useState<BusinessSubject | ''>('');
  const [modules, setModules] = useState<ModuleFormData[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>('admin@example.com');

  const { postData, loading } = usePostData<CaseStudyWithRelations, CreateCaseStudyRequest>(
    {
      successMessage: 'Case study created successfully!',
      errorMessage: 'Failed to create case study',
      redirectPath: '/admin',
    },
    {
      headers: {
        'admin-email': adminEmail,
      },
    }
  );

  // Check authentication on page load
  useEffect((): void => {
    const userType: string | null = localStorage.getItem('user_type');
    const email: string | null = localStorage.getItem('user_email');

    if (!userType || userType !== 'admin' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setAdminEmail(email);
    setIsLoading(false);
  }, [router]);

  const resetForm = (): void => {
    setTitle('');
    setShortDescription('');
    setDetails('');
    setSubject('');
    setModules([]);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const addModule = (): void => {
    const newModule: ModuleFormData = {
      id: `module-${Date.now()}`,
      title: '',
      shortDescription: '',
      details: '',
      orderNumber: modules.length + 1,
      exercises: [],
    };
    setModules([...modules, newModule]);
  };

  const updateModule = (moduleId: string, field: keyof Omit<ModuleFormData, 'exercises'>, value: string | number): void => {
    setModules(modules.map((m: ModuleFormData) => (m.id === moduleId ? { ...m, [field]: value } : m)));
  };

  const removeModule = (moduleId: string): void => {
    setModules(modules.filter((m: ModuleFormData) => m.id !== moduleId));
  };

  const addExercise = (moduleId: string): void => {
    const caseStudyModule: ModuleFormData | undefined = modules.find((m: ModuleFormData) => m.id === moduleId);
    if (!caseStudyModule) return;

    const newExercise: ExerciseFormData = {
      id: `exercise-${Date.now()}`,
      title: '',
      shortDescription: '',
      details: '',
      orderNumber: caseStudyModule.exercises.length + 1,
    };

    setModules(modules.map((m: ModuleFormData) => (m.id === moduleId ? { ...m, exercises: [...m.exercises, newExercise] } : m)));
  };

  const updateExercise = (moduleId: string, exerciseId: string, field: keyof ExerciseFormData, value: string | number): void => {
    setModules(
      modules.map((m: ModuleFormData) =>
        m.id === moduleId
          ? {
              ...m,
              exercises: m.exercises.map((e: ExerciseFormData) => (e.id === exerciseId ? { ...e, [field]: value } : e)),
            }
          : m
      )
    );
  };

  const removeExercise = (moduleId: string, exerciseId: string): void => {
    setModules(
      modules.map((m: ModuleFormData) => (m.id === moduleId ? { ...m, exercises: m.exercises.filter((e: ExerciseFormData) => e.id !== exerciseId) } : m))
    );
  };

  const handleSubmit = async (): Promise<void> => {
    // Validation
    if (!title.trim()) {
      showNotification({ type: 'error', message: 'Title is required' });
      return;
    }
    if (!shortDescription.trim()) {
      showNotification({ type: 'error', message: 'Short description is required' });
      return;
    }
    if (!details.trim()) {
      showNotification({ type: 'error', message: 'Details are required' });
      return;
    }
    if (!subject) {
      showNotification({ type: 'error', message: 'Subject is required' });
      return;
    }
    if (modules.length === 0) {
      showNotification({ type: 'error', message: 'At least one module is required' });
      return;
    }

    // Validate modules
    for (const caseStudyModule of modules) {
      if (!caseStudyModule.title.trim() || !caseStudyModule.shortDescription.trim() || !caseStudyModule.details.trim()) {
        showNotification({ type: 'error', message: 'All module fields are required' });
        return;
      }
      if (caseStudyModule.exercises.length === 0) {
        showNotification({ type: 'error', message: 'Each module must have at least one exercise' });
        return;
      }
      for (const exercise of caseStudyModule.exercises) {
        if (!exercise.title.trim() || !exercise.shortDescription.trim() || !exercise.details.trim()) {
          showNotification({ type: 'error', message: 'All exercise fields are required' });
          return;
        }
      }
    }

    const payload: CreateCaseStudyRequest = {
      title,
      shortDescription,
      details,
      subject: subject as BusinessSubject,
      modules: modules.map((module: ModuleFormData) => ({
        title: module.title,
        shortDescription: module.shortDescription,
        details: module.details,
        orderNumber: module.orderNumber,
        exercises: module.exercises.map((exercise: ExerciseFormData) => ({
          title: exercise.title,
          shortDescription: exercise.shortDescription,
          details: exercise.details,
          orderNumber: exercise.orderNumber,
        })),
      })),
    };

    try {
      const result: CaseStudyWithRelations | undefined = await postData('/api/case-studies', payload);
      if (result) {
        resetForm();
      }
    } catch (error: unknown) {
      console.error('Error creating case study:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-40 right-1/3 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-emerald-600 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Loading Admin Portal</h2>
                <p className="text-gray-600">Preparing your workspace...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <AdminNavbar title="Create New Case Study" userEmail={userEmail} onLogout={handleLogout} icon={<Shield className="h-8 w-8 text-white" />} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/admin')}
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                <BookOpen className="h-5 w-5 mr-2 text-emerald-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter case study title"
                    className="bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject *
                  </Label>
                  <Select value={subject} onValueChange={(value) => setSubject(value as BusinessSubject)}>
                    <SelectTrigger className="bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label htmlFor="shortDescription" className="text-sm font-medium text-gray-700">
                  Short Description *
                </Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief description of the case study"
                  rows={3}
                  className="bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>

              <div className="mt-6">
                <MarkdownEditor
                  objectId="case-study-details"
                  label="Details *"
                  modelValue={details}
                  onUpdate={setDetails}
                  placeholder="Enter detailed description using markdown..."
                  maxHeight={300}
                />
              </div>
            </div>

            {/* Modules Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-emerald-600" />
                  Modules ({modules.length})
                </h2>
                <Button
                  type="button"
                  onClick={addModule}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>

              {modules.map((module: ModuleFormData, moduleIndex: number) => (
                <div
                  key={module.id}
                  className="bg-gradient-to-br from-white/60 to-emerald-50/30 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 mb-6 shadow-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {moduleIndex + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Module {moduleIndex + 1}</h3>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeModule(module.id)}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Module Title *</Label>
                        <Input
                          value={module.title}
                          onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                          placeholder="Module title"
                          className="bg-white/70 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Order Number</Label>
                        <Input
                          type="number"
                          value={module.orderNumber}
                          onChange={(e) => updateModule(module.id, 'orderNumber', Number.parseInt(e.target.value) || 1)}
                          min={1}
                          className="bg-white/70 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Short Description *</Label>
                      <Textarea
                        value={module.shortDescription}
                        onChange={(e) => updateModule(module.id, 'shortDescription', e.target.value)}
                        placeholder="Brief module description"
                        rows={2}
                        className="bg-white/70 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <MarkdownEditor
                        objectId={`module-${module.id}-details`}
                        label="Module Details *"
                        modelValue={module.details}
                        onUpdate={(value) => updateModule(module.id, 'details', value)}
                        placeholder="Enter module details using markdown..."
                        maxHeight={200}
                      />
                    </div>

                    {/* Exercises for this module */}
                    <div className="bg-white/40 rounded-xl p-4 border border-emerald-100">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-emerald-600" />
                          Exercises ({module.exercises.length})
                        </h4>
                        <Button
                          type="button"
                          onClick={() => addExercise(module.id)}
                          size="sm"
                          variant="outline"
                          className="bg-white/50 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Exercise
                        </Button>
                      </div>

                      {module.exercises.map((exercise: ExerciseFormData, exerciseIndex: number) => (
                        <div key={exercise.id} className="bg-white/60 border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                                {exerciseIndex + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-900">Exercise {exerciseIndex + 1}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExercise(module.id, exercise.id)}
                              className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                value={exercise.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(module.id, exercise.id, 'title', e.target.value)}
                                placeholder="Exercise title"
                                className="bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                              />
                              <Input
                                type="number"
                                value={exercise.orderNumber}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  updateExercise(module.id, exercise.id, 'orderNumber', Number.parseInt(e.target.value) || 1)
                                }
                                placeholder="Order"
                                min={1}
                                className="bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                              />
                            </div>

                            <Textarea
                              value={exercise.shortDescription}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                updateExercise(module.id, exercise.id, 'shortDescription', e.target.value)
                              }
                              placeholder="Brief exercise description"
                              rows={1}
                              className="bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />

                            <MarkdownEditor
                              objectId={`exercise-${exercise.id}-details`}
                              label="Exercise Details *"
                              modelValue={exercise.details}
                              onUpdate={(value: string) => updateExercise(module.id, exercise.id, 'details', value)}
                              placeholder="Enter exercise details using markdown..."
                              maxHeight={150}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                className="bg-white/50 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Case Study
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
