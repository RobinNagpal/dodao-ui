'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Target, Sparkles, FileText, Lightbulb } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';

interface ModuleDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModule: {
    id: string;
    orderNumber: number;
    title: string;
    shortDescription: string;
    details: string;
  } | null;
}

export default function ModuleDetailsModal({ isOpen, onOpenChange, selectedModule }: ModuleDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto border-0 bg-gradient-to-br from-purple-50/95 via-blue-50/95 to-indigo-50/95 backdrop-blur-xl shadow-2xl">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-8 w-28 h-28 bg-purple-200/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-8 right-8 w-36 h-36 bg-blue-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-indigo-200/15 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <DialogHeader className="relative z-10">
          <div className="flex items-center space-x-4 mb-2">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-3 rounded-2xl shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
                {selectedModule && `Module ${selectedModule.orderNumber}: ${selectedModule.title}`}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {selectedModule && (
          <div className="relative z-10 space-y-6">
            {/* Short Description Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-xl">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Learning Overview</h4>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200/50">
                <p className="text-blue-900 text-lg leading-relaxed">{selectedModule.shortDescription}</p>
              </div>
            </div>

            {/* Module Details Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Detailed Content</h4>
              </div>
              <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-headings:font-semibold">
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedModule.details) }} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
