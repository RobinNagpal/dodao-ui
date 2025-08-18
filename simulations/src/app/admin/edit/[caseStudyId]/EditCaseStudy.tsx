'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Plus, Trash2, X, ArrowLeft } from 'lucide-react';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { BusinessSubject } from '@prisma/client';
import { UpdateCaseStudyRequest } from '@/types/api';

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
  orderNumber: number;
}

interface CaseStudy {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
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
      orderNumber: number;
    }[];
  }[];
}

interface EditCaseStudyClientProps {
  caseStudyId: string;
}

const subjectOptions = [
  { value: 'HR', label: 'Human Resources' },
  { value: 'ECONOMICS', label: 'Economics' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'OPERATIONS', label: 'Operations' },
];

export default function EditCaseStudyClient({ caseStudyId }: EditCaseStudyClientProps): JSX.Element {
  const router = useRouter();
  const { showNotification } = useNotificationContext();

  // Auth check
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form state
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [details, setDetails] = useState('');
  const [subject, setSubject] = useState<BusinessSubject | ''>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>('admin@example.com');

  // Fetch case study data
  const { data: caseStudy, loading: loadingCaseStudy } = useFetchData<CaseStudy>(
    `/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId },
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

  // Initialize form when case study data is loaded
  useEffect(() => {
    if (caseStudy) {
      setTitle(caseStudy.title);
      setShortDescription(caseStudy.shortDescription);
      setDetails(caseStudy.details);
      setSubject(caseStudy.subject);
      setModules(
        caseStudy.modules.map((module) => ({
          ...module,
          exercises: module.exercises.map((exercise) => ({ ...exercise })),
        }))
      );
    }
  }, [caseStudy]);

  const handleBack = () => {
    router.push('/admin');
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

    const payload: UpdateCaseStudyRequest = {
      title,
      shortDescription,
      details,
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

  if (isLoading || loadingCaseStudy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-900">Loading case study...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div className="bg-red-100 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Case Study</h1>
                <p className="text-gray-600">Welcome back, {userEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter case study title" />
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select value={subject} onValueChange={(value) => setSubject(value as BusinessSubject)}>
                  <SelectTrigger>
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

            <div>
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief description of the case study"
                rows={3}
              />
            </div>

            <div>
              <MarkdownEditor
                objectId="case-study-details"
                label="Details *"
                modelValue={details}
                onUpdate={setDetails}
                placeholder="Enter detailed description using markdown..."
                maxHeight={300}
              />
            </div>

            {/* Modules Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Modules</h3>
                <Button type="button" onClick={addModule} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>

              {modules.map((module, moduleIndex) => (
                <div key={`module-${moduleIndex}`} className="border rounded-lg p-4 mb-4">
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
                          onChange={(e) => updateModule(moduleIndex, 'orderNumber', parseInt(e.target.value) || 1)}
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
                                  onChange={(e) => updateExercise(moduleIndex, exerciseIndex, 'orderNumber', parseInt(e.target.value) || 1)}
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={updating}>
                {updating ? 'Updating...' : 'Update Case Study'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
