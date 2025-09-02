'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Plus, Trash2, X, BookOpen, Sparkles } from 'lucide-react';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import type { BusinessSubject } from '@prisma/client';
import type { UpdateCaseStudyRequest } from '@/types/api';
import AdminNavbar from '@/components/navigation/AdminNavbar';
import BackButton from '@/components/navigation/BackButton';
import AdminLoading from '@/components/admin/AdminLoading';
import { getSubjectDisplayName } from '@/utils/subject-utils';

interface Module {
  id?: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  exercises: Exercise[];
}

interface Exercise {
  id?: string;
  title: string;
  shortDescription: string;
  details: string;
  promptHint?: string;
  orderNumber: number;
}

interface CaseStudy {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  finalSummaryPromptInstructions?: string | null;
  subject: BusinessSubject;
  modules: {
    id: string;
    title: string;
    shortDescription: string;
    details: string;
    orderNumber: number;
    exercises: {
      id: string;
      title: string;
      shortDescription: string;
      details: string;
      promptHint?: string;
      orderNumber: number;
    }[];
  }[];
}

interface EditCaseStudyClientProps {
  caseStudyId: string;
}

const subjectOptions = (['HR', 'ECONOMICS', 'MARKETING', 'FINANCE', 'OPERATIONS'] as BusinessSubject[]).map((subject) => ({
  value: subject,
  label: getSubjectDisplayName(subject),
}));

export default function EditCaseStudyClient({ caseStudyId }: EditCaseStudyClientProps) {
  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [details, setDetails] = useState('');
  const [finalSummaryPromptInstructions, setFinalSummaryPromptInstructions] = useState('');
  const [subject, setSubject] = useState<BusinessSubject | ''>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>('admin@example.com');

  // Fetch case study data
  const { data: caseStudy, loading: loadingCaseStudy } = useFetchData<CaseStudy>(
    `/api/case-studies/${caseStudyId}?userType=admin&userEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !caseStudyId || !userEmail },
    'Failed to load case study'
  );

  const { putData, loading: updating } = usePutData(
    {
      successMessage: 'Case study updated successfully!',
      errorMessage: 'Failed to update case study',
      redirectPath: '/admin',
    },
    {
      headers: {
        'admin-email': adminEmail,
      },
    }
  );

  useEffect(() => {
    if (caseStudy) {
      setTitle(caseStudy.title);
      setShortDescription(caseStudy.shortDescription);
      setDetails(caseStudy.details);
      setFinalSummaryPromptInstructions(caseStudy.finalSummaryPromptInstructions || '');
      setSubject(caseStudy.subject);
      setModules(
        caseStudy.modules.map((module) => ({
          ...module,
          exercises: module.exercises.map((exercise) => ({ ...exercise })),
        }))
      );
    }
  }, [caseStudy]);

  const handleLogout = () => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const addModule = () => {
    const newModule: Module = {
      title: '',
      shortDescription: '',
      details: '',
      orderNumber: modules.length + 1,
      exercises: [],
    };
    setModules([...modules, newModule]);
  };

  const updateModule = (moduleIndex: number, field: keyof Omit<Module, 'exercises'>, value: string | number) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], [field]: value };
    setModules(updatedModules);
  };

  const removeModule = (moduleIndex: number) => {
    setModules(modules.filter((_, index) => index !== moduleIndex));
  };

  const addExercise = (moduleIndex: number) => {
    const newExercise: Exercise = {
      title: '',
      shortDescription: '',
      details: '',
      promptHint: '',
      orderNumber: modules[moduleIndex].exercises.length + 1,
    };

    const updatedModules = [...modules];
    updatedModules[moduleIndex].exercises.push(newExercise);
    setModules(updatedModules);
  };

  const updateExercise = (moduleIndex: number, exerciseIndex: number, field: keyof Exercise, value: string | number) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].exercises[exerciseIndex] = {
      ...updatedModules[moduleIndex].exercises[exerciseIndex],
      [field]: value,
    };
    setModules(updatedModules);
  };

  const removeExercise = (moduleIndex: number, exerciseIndex: number) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].exercises = updatedModules[moduleIndex].exercises.filter((_, index) => index !== exerciseIndex);
    setModules(updatedModules);
  };

  const handleSubmit = async () => {
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

    const payload: UpdateCaseStudyRequest = {
      title,
      shortDescription,
      details,
      finalSummaryPromptInstructions: finalSummaryPromptInstructions.trim() || null,
      subject: subject as BusinessSubject,
      modules: modules.map((module) => ({
        id: module.id,
        title: module.title,
        shortDescription: module.shortDescription,
        details: module.details,
        orderNumber: module.orderNumber,
        exercises: module.exercises.map((exercise) => ({
          id: exercise.id,
          title: exercise.title,
          shortDescription: exercise.shortDescription,
          details: exercise.details,
          promptHint: exercise.promptHint,
          orderNumber: exercise.orderNumber,
        })),
      })),
    };

    try {
      const result = await putData(`/api/case-studies/${caseStudyId}`, payload);
    } catch (error) {
      console.error('Error updating case study:', error);
    }
  };

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'admin' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setAdminEmail(email);
    setIsLoading(false);
  }, [router]);

  if (isLoading || loadingCaseStudy) {
    return <AdminLoading text="Loading case study..." subtitle="Preparing edit form..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <AdminNavbar title="Edit Case Study" userEmail={userEmail} onLogout={handleLogout} icon={<Shield className="h-8 w-8 text-white" />} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        <BackButton userType="admin" text="Back to Dashboard" href="/admin" />
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 p-8">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Basic Information</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-emerald-700 font-medium">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter case study title"
                    className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-emerald-700 font-medium">
                    Subject *
                  </Label>
                  <Select value={subject} onValueChange={(value) => setSubject(value as BusinessSubject)}>
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
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

              <div className="mt-4">
                <Label htmlFor="shortDescription" className="text-emerald-700 font-medium">
                  Short Description *
                </Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief description of the case study"
                  rows={3}
                  className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>

              <div className="mt-4">
                <MarkdownEditor
                  objectId="case-study-details"
                  label="Details *"
                  modelValue={details}
                  onUpdate={setDetails}
                  placeholder="Enter detailed description using markdown..."
                  maxHeight={300}
                />
              </div>

              <div className="mt-4">
                <MarkdownEditor
                  objectId="final-summary-instructions"
                  label="Final Summary Prompt Instructions"
                  modelValue={finalSummaryPromptInstructions}
                  onUpdate={setFinalSummaryPromptInstructions}
                  placeholder="Enter instructions for final summary generation (optional)..."
                  maxHeight={200}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-emerald-500" />
                  <span>Modules</span>
                </h3>
                <Button
                  type="button"
                  onClick={addModule}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>

              {modules.map((module, moduleIndex) => (
                <div key={`module-${moduleIndex}`} className="bg-white/60 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 mb-6 shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Module {moduleIndex + 1}</h4>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeModule(moduleIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Module Title *</Label>
                        <Input value={module.title} onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)} placeholder="Module title" />
                      </div>
                      <div>
                        <Label>Order Number</Label>
                        <Input
                          type="number"
                          value={module.orderNumber}
                          onChange={(e) => updateModule(moduleIndex, 'orderNumber', Number.parseInt(e.target.value) || 1)}
                          min={1}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Short Description *</Label>
                      <Textarea
                        value={module.shortDescription}
                        onChange={(e) => updateModule(moduleIndex, 'shortDescription', e.target.value)}
                        placeholder="Brief module description"
                        rows={2}
                      />
                    </div>

                    <div>
                      <MarkdownEditor
                        objectId={`module-${moduleIndex}-details`}
                        label="Module Details *"
                        modelValue={module.details}
                        onUpdate={(value: string) => updateModule(moduleIndex, 'details', value)}
                        placeholder="Enter module details using markdown..."
                        maxHeight={200}
                      />
                    </div>

                    {/* Exercises for this module */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">Exercises</h5>
                        <Button type="button" onClick={() => addExercise(moduleIndex)} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Exercise
                        </Button>
                      </div>

                      {module.exercises.map((exercise, exerciseIndex) => (
                        <div key={`exercise-${exerciseIndex}`} className="border border-gray-200 rounded p-3 mb-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Exercise {exerciseIndex + 1}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(moduleIndex, exerciseIndex)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Input
                                  value={exercise.title}
                                  onChange={(e) => updateExercise(moduleIndex, exerciseIndex, 'title', e.target.value)}
                                  placeholder="Exercise title"
                                />
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  value={exercise.orderNumber}
                                  onChange={(e) => updateExercise(moduleIndex, exerciseIndex, 'orderNumber', Number.parseInt(e.target.value) || 1)}
                                  placeholder="Order"
                                  min={1}
                                />
                              </div>
                            </div>

                            <div>
                              <Textarea
                                value={exercise.shortDescription}
                                onChange={(e) => updateExercise(moduleIndex, exerciseIndex, 'shortDescription', e.target.value)}
                                placeholder="Brief exercise description"
                                rows={1}
                              />
                            </div>

                            <div>
                              <MarkdownEditor
                                objectId={`exercise-${moduleIndex}-${exerciseIndex}-prompt-hint`}
                                label="Prompt Hint for AI Assistance (Optional)"
                                modelValue={exercise.promptHint || ''}
                                onUpdate={(value: string) => updateExercise(moduleIndex, exerciseIndex, 'promptHint', value)}
                                placeholder="Enter prompt hint using markdown..."
                                maxHeight={120}
                              />
                            </div>

                            <div>
                              <MarkdownEditor
                                objectId={`exercise-${moduleIndex}-${exerciseIndex}-details`}
                                label="Exercise Details *"
                                modelValue={exercise.details}
                                onUpdate={(value: string) => updateExercise(moduleIndex, exerciseIndex, 'details', value)}
                                placeholder="Enter exercise details using markdown..."
                                maxHeight={150}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-emerald-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updating}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {updating ? 'Updating...' : 'Update Case Study'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
