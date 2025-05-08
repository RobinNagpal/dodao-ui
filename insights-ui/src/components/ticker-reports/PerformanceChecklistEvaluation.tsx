import { FullCriterionEvaluation } from '@/types/public-equity/ticker-report-types';
import { parseMarkdown } from '@/util/parse-markdown';

export default function PerformanceChecklistEvaluation({ criterionEvaluation }: { criterionEvaluation?: FullCriterionEvaluation }) {
  return (
    <>
      {criterionEvaluation?.performanceChecklistEvaluation?.performanceChecklistItems?.length ? (
        <ul className="list-disc mt-2">
          {criterionEvaluation.performanceChecklistEvaluation.performanceChecklistItems.map((item, index) => (
            <div key={index + '_performance_checklist_' + criterionEvaluation.criterionKey} className="mb-5">
              <li className="flex items-start mb-2">
                <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                <span className="font-bold">{item.checklistItem}</span>
              </li>

              <div className="grid grid-cols-1 gap-y-2">
                <div className="pl-6">
                  <div className="font-bold text-sm">One-line Explanation:</div>
                  <div className="text-sm markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.oneLinerExplanation) }} />
                </div>

                <div className="pl-6">
                  <div className="font-bold text-sm">Information Used:</div>
                  <div className="text-sm markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.informationUsed) }} />
                </div>

                <div className="pl-6">
                  <div className="font-bold text-sm">Detailed Explanation:</div>
                  <div className="text-sm markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.detailedExplanation) }} />
                </div>

                <div className="pl-6">
                  <div className="font-bold text-sm">Evaluation Logic:</div>
                  <div className="text-sm markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.evaluationLogic) }} />
                </div>
              </div>
            </div>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center">No performance checklist available</p>
      )}
    </>
  );
}
