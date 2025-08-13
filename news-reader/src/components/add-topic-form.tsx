'use client';

import { NewsTopicFolderType, NewsTopicTemplateType as TemplateType, NewsTopicType, ROOT_FOLDER } from '@/lib/news-reader-types';
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
import Link from 'next/link';

interface AddTopicFormProps {
  onAdd: (newTopic: Partial<NewsTopicType>) => void;
  templates: TemplateType[];
  folders: NewsTopicFolderType[];
}

export default function AddTopicForm({ onAdd, templates, folders }: AddTopicFormProps) {
  const [activeMethod, setActiveMethod] = useState<string>('template');

  // Template-based form
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateTopic, setTemplateTopic] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [templateFilters, setTemplateFilters] = useState<string[]>([]);
  const [availableFilters, setAvailableFilters] = useState<string[]>([]);

  // Manual form
  const [manualTopic, setManualTopic] = useState<string>('');
  const [manualDescription, setManualDescription] = useState<string>('');
  const [manualFilters, setManualFilters] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState<string>('');

  const [selectedFolder, setSelectedFolder] = useState<string>(ROOT_FOLDER);

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
      setAvailableFilters([...template.availableFilters]);
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

  const addCustomFilterToManual = (): void => {
    if (customFilter.trim() && !manualFilters.includes(customFilter.trim())) {
      setManualFilters([...manualFilters, customFilter.trim()]);
      setAvailableFilters([...availableFilters, customFilter.trim()]);
      setCustomFilter('');
    }
  };

  const removeFilterFromTemplate = (filter: string): void => {
    setTemplateFilters(templateFilters.filter((f) => f !== filter));
  };

  const removeFilterFromManual = (filter: string): void => {
    setManualFilters(manualFilters.filter((f) => f !== filter));
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
        folderId: selectedFolder === ROOT_FOLDER ? null : selectedFolder,
      });
      setTemplateTopic('');
      setTemplateDescription('');
      setTemplateFilters([]);
      setSelectedTemplate('');
      setSelectedFolder(ROOT_FOLDER);
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
        folderId: selectedFolder === ROOT_FOLDER ? null : selectedFolder,
      });
      setManualTopic('');
      setManualDescription('');
      setManualFilters([]);
      setSelectedFolder(ROOT_FOLDER);
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
          <Link href="/news-topic-templates" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Create Template
          </Link>
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
                    <SelectItem value={ROOT_FOLDER}>No Folder</SelectItem>
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
                <SelectItem value={ROOT_FOLDER}>No Folder</SelectItem>
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
    </Tabs>
  );
}
