'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, BookOpen, Sparkles } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';

interface CaseStudyInstructionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  caseStudyDetails: string;
  children?: React.ReactNode;
}

export default function CaseStudyInstructionsModal({ isOpen, onOpenChange, caseStudyDetails, children }: CaseStudyInstructionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto border-0 bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-purple-50/95 backdrop-blur-xl shadow-2xl">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        <DialogHeader className="relative z-10">
          <div className="flex items-center space-x-4 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Case Study Details
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="relative z-10">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-xl">
            <div
              className="markdown-body prose prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(caseStudyDetails) }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Default trigger button component for easy use
export function CaseStudyInstructionsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
    >
      <Info className="h-4 w-4 mr-2" />
      Case Study Instructions
    </Button>
  );
}
