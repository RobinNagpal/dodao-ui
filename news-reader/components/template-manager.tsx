'use client';

import { NewsTopicTemplate as TemplateType } from '@/lib/news-reader-types';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, LayoutTemplateIcon as Template, Plus, X, Shield } from 'lucide-react';

const availableFilters: string[] = [
  'Financial Changes',
  'Core Management Changes',
  'Product Launches',
  'Regulatory Updates',
  'Partnership Announcements',
  'Market Expansion',
  'Technology Breakthroughs',
  'Legal Issues',
  'Acquisition News',
  'IPO Updates',
  'Merger & Acquisitions',
  'Stock Performance',
  'Earnings Reports',
  'Product Recalls',
  'Environmental Impact',
];

interface TemplateManagerProps {
  templates: TemplateType[];
  onAdd: (newTemplate: Partial<TemplateType>) => void;
  onDelete: (id: number) => void;
}

export default function TemplateManager({ templates, onAdd, onDelete }: TemplateManagerProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateDescription, setNewTemplateDescription] = useState<string>('');
  const [newTemplateFilters, setNewTemplateFilters] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState<string>('');

  const handleFilterChange = (filter: string, checked: boolean): void => {
    if (checked) {
      setNewTemplateFilters([...newTemplateFilters, filter]);
    } else {
      setNewTemplateFilters(newTemplateFilters.filter((f) => f !== filter));
    }
  };

  const addCustomFilter = (): void => {
    if (customFilter.trim() && !newTemplateFilters.includes(customFilter.trim())) {
      setNewTemplateFilters([...newTemplateFilters, customFilter.trim()]);
      setCustomFilter('');
    }
  };

  const removeFilter = (filter: string): void => {
    setNewTemplateFilters(newTemplateFilters.filter((f) => f !== filter));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newTemplateName.trim() && newTemplateDescription.trim()) {
      onAdd({
        name: newTemplateName.trim(),
        description: newTemplateDescription.trim(),
        filters: newTemplateFilters,
      });
      setNewTemplateName('');
      setNewTemplateDescription('');
      setNewTemplateFilters([]);
      setShowAddForm(false);
    }
  };

  const resetForm = (): void => {
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateFilters([]);
    setCustomFilter('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Manager</h2>
          <p className="text-muted-foreground">Create and manage templates for quick topic setup</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
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
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Fintech Company, Healthcare Startup"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Template Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Describe what type of companies or topics this template is for..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Template Filters</Label>
                <p className="text-sm text-muted-foreground">Select the filters that should be included by default in this template</p>

                <div className="grid grid-cols-2 gap-3">
                  {availableFilters.map((filter) => (
                    <div key={filter} className="flex items-center space-x-2">
                      <Checkbox id={filter} checked={newTemplateFilters.includes(filter)} onCheckedChange={(checked) => handleFilterChange(filter, checked)} />
                      <Label htmlFor={filter} className="text-sm font-normal">
                        {filter}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customFilter}
                    onChange={(e) => setCustomFilter(e.target.value)}
                    placeholder="Add custom filter to template..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFilter())}
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
                        {newTemplateFilters.map((filter) => (
                          <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                            {filter}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Create Template
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
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
                  <Button variant="ghost" size="sm" onClick={() => onDelete(template.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {template.filters.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Included Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.filters.map((filter) => (
                      <Badge key={filter} variant="secondary" className="text-xs">
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
    </div>
  );
}
