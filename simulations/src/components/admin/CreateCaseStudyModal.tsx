'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import { Plus, X, Trash2 } from 'lucide-react';
import { BusinessSubject } from '@prisma/client';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { CreateCaseStudyRequest, CaseStudyWithRelations } from '@/types/api';

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

interface CreateCaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function CreateCaseStudyModal({ isOpen, onClose, onSuccess }: CreateCaseStudyModalProps): JSX.Element {
  const { showNotification } = useNotificationContext();

  // Form state
  const [title, setTitle] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [subject, setSubject] = useState<BusinessSubject | ''>('');
  const [modules, setModules] = useState<ModuleFormData[]>([]);

  const adminEmail: string = localStorage.getItem('user_email') || 'admin@example.com';

  const { postData, loading } = usePostData<CaseStudyWithRelations, CreateCaseStudyRequest>(
    {
      successMessage: 'Case study created successfully!',
      errorMessage: 'Failed to create case study',
    },
    {
      headers: {
        'admin-email': adminEmail,
      },
    }
  );

  const resetForm = (): void => {
    setTitle('');
    setShortDescription('');
    setDetails('');
    setSubject('');
    setModules([]);
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
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
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Error creating case study:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create New Case Study</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] p-4">
          <div className="space-y-4">
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

              {modules.map((module: ModuleFormData, moduleIndex: number) => (
                <div key={module.id} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Module {moduleIndex + 1}</h4>
                    <Button type="button" variant="destructive" size="sm" onClick={(): void => removeModule(module.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Module Title *</Label>
                        <Input value={module.title} onChange={(e) => updateModule(module.id, 'title', e.target.value)} placeholder="Module title" />
                      </div>
                      <div>
                        <Label>Order Number</Label>
                        <Input
                          type="number"
                          value={module.orderNumber}
                          onChange={(e) => updateModule(module.id, 'orderNumber', parseInt(e.target.value) || 1)}
                          min={1}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Short Description *</Label>
                      <Textarea
                        value={module.shortDescription}
                        onChange={(e) => updateModule(module.id, 'shortDescription', e.target.value)}
                        placeholder="Brief module description"
                        rows={2}
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
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">Exercises</h5>
                        <Button type="button" onClick={() => addExercise(module.id)} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Exercise
                        </Button>
                      </div>

                      {module.exercises.map((exercise: ExerciseFormData, exerciseIndex: number) => (
                        <div key={exercise.id} className="border border-gray-200 rounded p-3 mb-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Exercise {exerciseIndex + 1}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={(): void => removeExercise(module.id, exercise.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Exercise Title *</Label>
                                <Input
                                  value={exercise.title}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateExercise(module.id, exercise.id, 'title', e.target.value)}
                                  placeholder="Exercise title"
                                />
                              </div>
                              <div>
                                <Label>Order Number</Label>
                                <Input
                                  type="number"
                                  value={exercise.orderNumber}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                                    updateExercise(module.id, exercise.id, 'orderNumber', parseInt(e.target.value) || 1)
                                  }
                                  min={1}
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Short Description *</Label>
                              <Textarea
                                value={exercise.shortDescription}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void =>
                                  updateExercise(module.id, exercise.id, 'shortDescription', e.target.value)
                                }
                                placeholder="Brief exercise description"
                                rows={1}
                              />
                            </div>

                            <div>
                              <MarkdownEditor
                                objectId={`exercise-${exercise.id}-details`}
                                label="Exercise Details *"
                                modelValue={exercise.details}
                                onUpdate={(value: string): void => updateExercise(module.id, exercise.id, 'details', value)}
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
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Case Study'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
