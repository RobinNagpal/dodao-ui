'use client';

import { NewsTopicFolderType, NewsTopicTemplateType as TemplateType, NewsTopicType } from '@/lib/news-reader-types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, LayoutTemplateIcon as Template, Settings, Wand2 } from 'lucide-react';

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

interface AddTopicFormProps {
  onAdd: (newTopic: Partial<NewsTopicType>) => void;
  templates: TemplateType[];
  onAddTemplate: (newTemplate: Partial<TemplateType>) => void;
  folders: NewsTopicFolderType[];
  getFolderPath: (folderId: string | null, folders: NewsTopicFolderType[], path?: string[]) => string[];
}

export default function AddTopicForm({ onAdd, templates, onAddTemplate, folders, getFolderPath }: AddTopicFormProps) {
  const [activeMethod, setActiveMethod] = useState<string>('template');

  // Template-based form
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateTopic, setTemplateTopic] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [templateFilters, setTemplateFilters] = useState<string[]>([]);

  // Manual form
  const [manualTopic, setManualTopic] = useState<string>('');
  const [manualDescription, setManualDescription] = useState<string>('');
  const [manualFilters, setManualFilters] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState<string>('');

  // New template form
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateDescription, setNewTemplateDescription] = useState<string>('');
  const [newTemplateFilters, setNewTemplateFilters] = useState<string[]>([]);
  const [newTemplateCustomFilter, setNewTemplateCustomFilter] = useState<string>('');

  const [selectedFolder, setSelectedFolder] = useState<string>('');

  // Flatten folders for selection
  const flattenFolders = (folders: NewsTopicFolderType[], level = 0): (NewsTopicFolderType & { level: number })[] => {
    let result: (NewsTopicFolderType & { level: number })[] = [];
    folders.forEach((folder) => {
      result.push({ ...folder, level });
      if (folder.children.length > 0) {
        result = result.concat(flattenFolders(folder.children, level + 1));
      }
    });
    return result;
  };

  const flatFolders = flattenFolders(folders);

  const handleTemplateSelect = (templateId: string): void => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setTemplateFilters([...template.filters]);
      setTemplateDescription(template.description);
    }
  };

  const handleTemplateFilterChange = (filter: string, checked: boolean | string): void => {
    if (checked) {
      setTemplateFilters([...templateFilters, filter]);
    } else {
      setTemplateFilters(templateFilters.filter((f) => f !== filter));
    }
  };

  const handleManualFilterChange = (filter: string, checked: boolean | string): void => {
    if (checked) {
      setManualFilters([...manualFilters, filter]);
    } else {
      setManualFilters(manualFilters.filter((f) => f !== filter));
    }
  };

  const handleNewTemplateFilterChange = (filter: string, checked: boolean | string): void => {
    if (checked) {
      setNewTemplateFilters([...newTemplateFilters, filter]);
    } else {
      setNewTemplateFilters(newTemplateFilters.filter((f) => f !== filter));
    }
  };

  const addCustomFilterToManual = (): void => {
    if (customFilter.trim() && !manualFilters.includes(customFilter.trim())) {
      setManualFilters([...manualFilters, customFilter.trim()]);
      setCustomFilter('');
    }
  };

  const addCustomFilterToNewTemplate = (): void => {
    if (newTemplateCustomFilter.trim() && !newTemplateFilters.includes(newTemplateCustomFilter.trim())) {
      setNewTemplateFilters([...newTemplateFilters, newTemplateCustomFilter.trim()]);
      setNewTemplateCustomFilter('');
    }
  };

  const removeFilterFromTemplate = (filter: string): void => {
    setTemplateFilters(templateFilters.filter((f) => f !== filter));
  };

  const removeFilterFromManual = (filter: string): void => {
    setManualFilters(manualFilters.filter((f) => f !== filter));
  };

  const removeFilterFromNewTemplate = (filter: string): void => {
    setNewTemplateFilters(newTemplateFilters.filter((f) => f !== filter));
  };

  const handleTemplateSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (templateTopic.trim() && templateDescription.trim() && selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      onAdd({
        topic: templateTopic.trim(),
        description: templateDescription.trim(),
        filters: templateFilters,
        templateUsed: template!.name,
        folderId: selectedFolder ? selectedFolder : null,
      });
      setTemplateTopic('');
      setTemplateDescription('');
      setTemplateFilters([]);
      setSelectedTemplate('');
      setSelectedFolder('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (manualTopic.trim() && manualDescription.trim()) {
      onAdd({
        topic: manualTopic.trim(),
        description: manualDescription.trim(),
        filters: manualFilters,
        templateUsed: 'Custom',
        folderId: selectedFolder ? selectedFolder : null,
      });
      setManualTopic('');
      setManualDescription('');
      setManualFilters([]);
      setSelectedFolder('');
    }
  };

  const handleNewTemplateSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newTemplateName.trim() && newTemplateDescription.trim()) {
      onAddTemplate({
        name: newTemplateName.trim(),
        description: newTemplateDescription.trim(),
        filters: newTemplateFilters,
      });
      setNewTemplateName('');
      setNewTemplateDescription('');
      setNewTemplateFilters([]);
      // Switch to template method and select the new template
      setActiveMethod('template');
      setSelectedFolder('');
    }
  };

  return (
    <Tabs value={activeMethod} onValueChange={setActiveMethod} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="template" className="flex items-center gap-2">
          <Template className="h-4 w-4" />
          Use Template
        </TabsTrigger>
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Manual Setup
        </TabsTrigger>
        <TabsTrigger value="new-template" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Create Template
        </TabsTrigger>
      </TabsList>

      <TabsContent value="template" className="mt-6">
        <form onSubmit={handleTemplateSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template-select">Select Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">{template.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <>
              <div className="space-y-2">
                <Label htmlFor="template-topic">News Topic</Label>
                <Input
                  id="template-topic"
                  value={templateTopic}
                  onChange={(e) => setTemplateTopic(e.target.value)}
                  placeholder="e.g., Tesla, OpenAI, Apple"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Short Description</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe what kind of news you want to see for this topic..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="folder-select">Folder (Optional)</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a folder or leave empty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Folder</SelectItem>
                    {flatFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span style={{ marginLeft: `${folder.level * 12}px` }}>
                            {'  '.repeat(folder.level)}
                            {folder.level > 0 && '└ '}
                            {folder.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Template Filters (Customize as needed)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableFilters.map((filter) => (
                    <div key={filter} className="flex items-center space-x-2">
                      <Checkbox
                        id={`template-${filter}`}
                        checked={templateFilters.includes(filter)}
                        onCheckedChange={(checked) => handleTemplateFilterChange(filter, checked)}
                      />
                      <Label htmlFor={`template-${filter}`} className="text-sm font-normal">
                        {filter}
                      </Label>
                    </div>
                  ))}
                </div>

                {templateFilters.length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <Label className="text-sm font-medium">Selected Filters:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {templateFilters.map((filter) => (
                          <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                            {filter}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterFromTemplate(filter)} />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Button type="submit" className="w-full">
                Add Topic with Template
              </Button>
            </>
          )}
        </form>
      </TabsContent>

      <TabsContent value="manual" className="mt-6">
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="manual-topic">News Topic</Label>
            <Input id="manual-topic" value={manualTopic} onChange={(e) => setManualTopic(e.target.value)} placeholder="e.g., Tesla, OpenAI, Apple" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-description">Short Description</Label>
            <Textarea
              id="manual-description"
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="Describe what kind of news you want to see for this topic..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-select">Folder (Optional)</Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder or leave empty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Folder</SelectItem>
                {flatFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span style={{ marginLeft: `${folder.level * 12}px` }}>
                        {'  '.repeat(folder.level)}
                        {folder.level > 0 && '└ '}
                        {folder.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Filters</Label>
            <p className="text-sm text-muted-foreground">Select filters to only show news when these conditions are met</p>

            <div className="grid grid-cols-2 gap-3">
              {availableFilters.map((filter) => (
                <div key={filter} className="flex items-center space-x-2">
                  <Checkbox
                    id={`manual-${filter}`}
                    checked={manualFilters.includes(filter)}
                    onCheckedChange={(checked) => handleManualFilterChange(filter, checked)}
                  />
                  <Label htmlFor={`manual-${filter}`} className="text-sm font-normal">
                    {filter}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={customFilter}
                onChange={(e) => setCustomFilter(e.target.value)}
                placeholder="Add custom filter..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFilterToManual())}
              />
              <Button type="button" variant="outline" onClick={addCustomFilterToManual}>
                Add
              </Button>
            </div>

            {manualFilters.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <Label className="text-sm font-medium">Selected Filters:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {manualFilters.map((filter) => (
                      <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                        {filter}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterFromManual(filter)} />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Button type="submit" className="w-full">
            Add Topic Manually
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="new-template" className="mt-6">
        <form onSubmit={handleNewTemplateSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-template-name">Template Name</Label>
            <Input
              id="new-template-name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g., Fintech Company, Healthcare Startup"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-template-description">Template Description</Label>
            <Textarea
              id="new-template-description"
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
                  <Checkbox
                    id={`new-template-${filter}`}
                    checked={newTemplateFilters.includes(filter)}
                    onCheckedChange={(checked) => handleNewTemplateFilterChange(filter, checked)}
                  />
                  <Label htmlFor={`new-template-${filter}`} className="text-sm font-normal">
                    {filter}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newTemplateCustomFilter}
                onChange={(e) => setNewTemplateCustomFilter(e.target.value)}
                placeholder="Add custom filter to template..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFilterToNewTemplate())}
              />
              <Button type="button" variant="outline" onClick={addCustomFilterToNewTemplate}>
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
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterFromNewTemplate(filter)} />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Button type="submit" className="w-full">
            Create Template
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
