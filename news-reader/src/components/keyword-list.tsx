'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, Filter } from 'lucide-react';

interface Keyword {
  id: number;
  keyword: string;
  description: string;
  filters: string[];
  createdAt: string;
}

interface KeywordListProps {
  keywords: Keyword[];
  onDelete: (id: number) => void;
}

export default function KeywordList({ keywords, onDelete }: KeywordListProps) {
  if (keywords.length === 0) {
    return (
      <div className="text-center py-12">
        <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Keywords Configured</h3>
        <p className="text-muted-foreground mb-4">Add your first keyword to start tracking news articles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Keywords</h2>
        <Badge variant="outline">
          {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} configured
        </Badge>
      </div>

      <div className="grid gap-4">
        {keywords.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.keyword}</CardTitle>
                  <CardDescription className="mt-1">{item.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created on {new Date(item.createdAt).toLocaleDateString()}
                </div>

                {item.filters.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.filters.map((filter) => (
                        <Badge key={filter} variant="secondary" className="text-xs">
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
