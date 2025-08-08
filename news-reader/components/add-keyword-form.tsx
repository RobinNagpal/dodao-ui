'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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
];

interface KeywordData {
  keyword: string;
  description: string;
  filters: string[];
}

interface AddKeywordFormProps {
  onAdd: (data: KeywordData) => void;
}

export default function AddKeywordForm({ onAdd }: AddKeywordFormProps) {
  const [keyword, setKeyword] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState<string>('');

  const handleFilterChange = (filter: string, checked: boolean | string): void => {
    if (checked) {
      setSelectedFilters([...selectedFilters, filter]);
    } else {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    }
  };

  const addCustomFilter = (): void => {
    if (customFilter.trim() && !selectedFilters.includes(customFilter.trim())) {
      setSelectedFilters([...selectedFilters, customFilter.trim()]);
      setCustomFilter('');
    }
  };

  const removeFilter = (filter: string): void => {
    setSelectedFilters(selectedFilters.filter((f) => f !== filter));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (keyword.trim() && description.trim()) {
      onAdd({
        keyword: keyword.trim(),
        description: description.trim(),
        filters: selectedFilters,
      });
      setKeyword('');
      setDescription('');
      setSelectedFilters([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="keyword">Keyword</Label>
        <Input id="keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g., Tesla, OpenAI, Apple" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what kind of news you want to see for this keyword..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Filters</Label>
        <p className="text-sm text-muted-foreground">Select filters to only show news when these conditions are met</p>

        <div className="grid grid-cols-2 gap-3">
          {availableFilters.map((filter) => (
            <div key={filter} className="flex items-center space-x-2">
              <Checkbox id={filter} checked={selectedFilters.includes(filter)} onCheckedChange={(checked) => handleFilterChange(filter, checked)} />
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
            placeholder="Add custom filter..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFilter())}
          />
          <Button type="button" variant="outline" onClick={addCustomFilter}>
            Add
          </Button>
        </div>

        {selectedFilters.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <Label className="text-sm font-medium">Selected Filters:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFilters.map((filter) => (
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

      <Button type="submit" className="w-full">
        Add Keyword
      </Button>
    </form>
  );
}
