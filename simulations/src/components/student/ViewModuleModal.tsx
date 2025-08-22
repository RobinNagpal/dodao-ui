'use client';

import { Button } from '@/components/ui/button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { parseMarkdown } from '@/utils/parse-markdown';
import { Check, Lightbulb, FileText } from 'lucide-react';

interface ModuleModalProps {
  open: boolean;
  onClose: () => void;
  selectedModule: any;
  hasModuleInstructionsRead: (moduleId: string) => boolean;
  handleMarkInstructionAsRead: (type: 'case_study' | 'module', moduleId?: string) => Promise<void>;
  updatingStatus: boolean;
}

export default function ViewModuleModal({
  open,
  onClose,
  selectedModule,
  hasModuleInstructionsRead,
  handleMarkInstructionAsRead,
  updatingStatus,
}: ModuleModalProps) {
  return (
    <FullPageModal
      open={open}
      onClose={onClose}
      title={
        selectedModule && (
          <span className="text-2xl font-bold">
            Module {selectedModule.orderNumber}: {selectedModule.title}
          </span>
        )
      }
    >
      {selectedModule && (
        <div className="px-8 text-left mx-auto space-y-6 pb-4">
          {/* Short Description Section */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-xl">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Short Description</h4>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200/50">
              <p className="text-blue-900 text-base leading-relaxed">{selectedModule.shortDescription}</p>
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
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedModule.details) }} />
          </div>

          {/* Read Module Instructions Button */}
          {!hasModuleInstructionsRead(selectedModule.id) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
              <p className="text-blue-900 mb-4 font-medium">Please confirm that you have read and understood the module instructions.</p>
              <Button
                onClick={() => handleMarkInstructionAsRead('module', selectedModule.id)}
                disabled={updatingStatus}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {updatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Marking as Read...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />I Have Read the Module Instructions
                  </>
                )}
              </Button>
            </div>
          )}

          {hasModuleInstructionsRead(selectedModule.id) && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
              <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">You have read the module instructions</p>
            </div>
          )}
        </div>
      )}
    </FullPageModal>
  );
}
