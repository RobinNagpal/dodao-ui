import ViewCaseStudyInstructionsModal from '@/components/shared/ViewCaseStudyInstructionsModal';
import ViewModuleModal from '@/components/shared/ViewModuleModal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CaseStudyWithRelationsForStudents, ExerciseWithAttemptsResponse } from '@/types/api';
import { parseMarkdown } from '@/utils/parse-markdown';
import type { CaseStudyModule } from '@prisma/client';
import { Eye, FileText, Zap } from 'lucide-react';
import { useState } from 'react';

/**
 * -----------------------------
 * Child Component: ExerciseDetailsCard
 * -----------------------------
 * Owns: case study/module modal open state + rendering of details and prompt hint
 */
interface ExerciseDetailsCardProps {
  exerciseData: ExerciseWithAttemptsResponse;
  caseStudyData?: CaseStudyWithRelationsForStudents | null;
  currentModule?: CaseStudyModule | null;
}

export function ExerciseDetailsCard({ exerciseData, caseStudyData, currentModule }: ExerciseDetailsCardProps) {
  const [showCaseStudyModal, setShowCaseStudyModal] = useState<boolean>(false);
  const [showModuleModal, setShowModuleModal] = useState<boolean>(false);

  const openCaseStudyModal = (): void => setShowCaseStudyModal(true);
  const closeCaseStudyModal = (): void => setShowCaseStudyModal(false);
  const openModuleModal = (): void => setShowModuleModal(true);
  const closeModuleModal = (): void => setShowModuleModal(false);

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{exerciseData.title}</h3>
          </div>

          <div className="flex items-center space-x-3 ml-4">
            <button
              onClick={openCaseStudyModal}
              disabled={!caseStudyData}
              className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="View Case Study Details"
            >
              <Eye className="h-4 w-4 mr-2" />
              Case Study Details
            </button>
            <button
              onClick={openModuleModal}
              disabled={!currentModule}
              className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="View Module Details"
            >
              <Eye className="h-4 w-4 mr-2" />
              Module Details
            </button>
          </div>
        </div>

        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
          Exercise Details:
        </h4>
        <div className="markdown-body prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(exerciseData.details) }} />

        {exerciseData.promptHint ? (
          <div className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="prompt-hint" className="border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center text-left">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-semibold text-gray-900">Prompt Hint</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="markdown-body prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(exerciseData.promptHint) }} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : null}
      </div>

      {caseStudyData ? (
        <ViewCaseStudyInstructionsModal
          open={showCaseStudyModal}
          onClose={closeCaseStudyModal}
          caseStudy={caseStudyData}
          hasCaseStudyInstructionsRead={() => true}
          handleMarkInstructionAsRead={async () => {}}
          updatingStatus={true}
          onCaseStudyUpdate={() => {
            // Students don't edit, so this should not be called
            // Intentionally no-op
          }}
        />
      ) : null}

      {caseStudyData && currentModule ? (
        <ViewModuleModal
          open={showModuleModal}
          onClose={closeModuleModal}
          selectedModule={currentModule as CaseStudyModule}
          hasModuleInstructionsRead={() => true}
          handleMarkInstructionAsRead={async () => {}}
          updatingStatus={true}
          caseStudy={caseStudyData}
          onModuleUpdate={() => {
            // Students don't edit, so this should not be called
            // Intentionally no-op
          }}
        />
      ) : null}
    </div>
  );
}
