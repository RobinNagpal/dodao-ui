'use client';

import { NewsTopicTemplateType as TemplateType } from '@/lib/news-reader-types';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, LayoutTemplateIcon as Template, Plus, X, Shield, ArrowLeft, Folder } from 'lucide-react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { NewsTopicTemplate } from '@prisma/client';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

// Define types for API requests and responses
interface CreateTemplatePayload {
  name: string;
  description: string;
  filters: string[];
  availableFilters: string[];
  isDefault: boolean;
}

interface CreateTemplateResponse extends NewsTopicTemplate {}

interface TemplateManagerProps {
  fetchTemplates: () => void;
  templates: TemplateType[];
}

export default function TemplateManager({ templates, fetchTemplates }: TemplateManagerProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateDescription, setNewTemplateDescription] = useState<string>('');
  const [newTemplateFilters, setNewTemplateFilters] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState<string>('');
  const [availableFilters, setAvailableFilters] = useState<string[]>([]);
  const [templateToDelete, setTemplateToDelete] = useState<TemplateType | null>(null);

  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  // Use the usePostData hook for creating templates
  const { postData: createTemplate, loading: creatingTemplate } = usePostData<CreateTemplateResponse, CreateTemplatePayload>({
    successMessage: 'Template created successfully',
    errorMessage: 'Failed to create template',
  });

  // Use the usePostData hook for deleting templates
  const { deleteData: deleteTemplate, loading: deletingTemplate } = useDeleteData<NewsTopicTemplate, void>({
    successMessage: 'Template deleted successfully',
    errorMessage: 'Failed to delete template',
  });

  const handleFilterChange = (filter: string, checked: boolean | string): void => {
    if (checked) {
      setNewTemplateFilters([...newTemplateFilters, filter]);
    } else {
      setNewTemplateFilters(newTemplateFilters.filter((f: string): boolean => f !== filter));
    }
  };

  const addCustomFilter = (): void => {
    const trimmedFilter: string = customFilter.trim();
    if (trimmedFilter && !newTemplateFilters.includes(trimmedFilter)) {
      setNewTemplateFilters([...newTemplateFilters, trimmedFilter]);
      setAvailableFilters([...availableFilters, trimmedFilter]);
      setCustomFilter('');
    }
  };

  const removeFilter = (filter: string): void => {
    setNewTemplateFilters(newTemplateFilters.filter((f: string): boolean => f !== filter));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmedName: string = newTemplateName.trim();
    const trimmedDescription: string = newTemplateDescription.trim();

    if (trimmedName && trimmedDescription) {
      const payload: CreateTemplatePayload = {
        name: trimmedName,
        description: trimmedDescription,
        filters: newTemplateFilters,
        availableFilters: availableFilters.length > 0 ? availableFilters : newTemplateFilters,
        isDefault: false,
      };

      // Use the createTemplate function from usePostData
      const success = await createTemplate(`${baseUrl}/api/news-topic-templates`, payload);

      if (success) {
        setNewTemplateName('');
        setNewTemplateDescription('');
        setNewTemplateFilters([]);
        setShowAddForm(false);
        fetchTemplates();
      }
    } else {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Name and description are required',
      });
    }
  };

  const resetForm = (): void => {
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateFilters([]);
    setCustomFilter('');
    setShowAddForm(false);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!templateToDelete) return;

    // Use the deleteTemplate function from useDeleteData
    const success = await deleteTemplate(`${baseUrl}/api/news-topic-templates/${templateToDelete.id}`);

    // If onDelete is provided, call it as well (for backward compatibility)
    if (success) {
      fetchTemplates();
    }

    // Close the modal
    setTemplateToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2" type="button">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Button
          onClick={(): void => setShowAddForm(!showAddForm)}
          variant="outline"
          className="flex items-center gap-2 border-primary"
          disabled={creatingTemplate || deletingTemplate}
        >
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Manager</h2>
          <p className="text-muted-foreground">Create and manage templates for quick topic setup</p>
        </div>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
            <CardDescription>Create a reusable template with predefined filters for similar types of topics</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Fintech Company, Healthcare Startup"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Template Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplateDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setNewTemplateDescription(e.target.value)}
                  placeholder="Describe what type of companies or topics this template is for..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Template Filters</Label>
                <p className="text-sm text-muted-foreground">Select the filters that should be included by default in this template</p>

                <div className="grid grid-cols-2 gap-3">
                  {availableFilters.map((filter: string) => (
                    <div key={filter} className="flex items-center space-x-2">
                      <Checkbox
                        id={filter}
                        checked={newTemplateFilters.includes(filter)}
                        onCheckedChange={(checked: boolean | string): void => handleFilterChange(filter, checked)}
                      />
                      <Label htmlFor={filter} className="text-sm font-normal">
                        {filter}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setCustomFilter(e.target.value)}
                    placeholder="Add custom filter to template..."
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomFilter();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addCustomFilter}>
                    Add
                  </Button>
                </div>

                {newTemplateFilters.length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <Label className="text-sm font-medium">Template Filters:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newTemplateFilters.map((filter: string) => (
                          <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                            {filter}
                            <X className="h-3 w-3 cursor-pointer" onClick={(): void => removeFilter(filter)} />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="default" className="flex-1" disabled={creatingTemplate}>
                  {creatingTemplate ? 'Creating...' : 'Create Template'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={creatingTemplate}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No News Topic Templates Created</h3>
            <p className="text-muted-foreground">Create your first New Topic Template and then use it to create news topics</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template: TemplateType) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Template className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.isDefault && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                  </div>
                  {!template.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(): void => {
                        setTemplateToDelete(template);
                      }}
                      className="text-destructive hover:text-destructive"
                      disabled={deletingTemplate}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {template.filters.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Activated Filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.filters.map((filter: string) => (
                        <Badge key={filter} variant="secondary" className="text-xs">
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {template.availableFilters && template.availableFilters.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Available Filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.availableFilters.map((filter: string) => (
                        <Badge key={filter} variant="outline" className="text-xs">
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        confirmationText={`Are you sure you want to delete the template "${templateToDelete?.name}"? This action cannot be undone.`}
        confirming={deletingTemplate}
        askForTextInput={false}
        showSemiTransparentBg={true}
      />
    </div>
  );
}
