import { FullCriterionEvaluation } from '@/types/public-equity/ticker-report-types';
import { parseMarkdown } from '@/util/parse-markdown';

export default function PerformanceChecklistEvaluation({ criterionEvaluation }: { criterionEvaluation?: FullCriterionEvaluation }) {
  return (
    <>
      {criterionEvaluation?.performanceChecklistEvaluation?.performanceChecklistItems?.length ? (
        <ul className="list-disc mt-2">
          {criterionEvaluation.performanceChecklistEvaluation.performanceChecklistItems.map((item, index) => (
            <div key={index + '_performance_checklist_' + criterionEvaluation.criterionKey} className="mb-3">
              <li className="flex items-start">
                <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                <span className="font-bold">{item.checklistItem}</span>
              </li>
              <li className="text-sm flex gap-1">
                <span className="font-bold whitespace-nowrap">One-line Explanation: </span>
                <span className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.oneLinerExplanation) }} />
              </li>
              <li className="text-sm flex gap-1">
                <span className="font-bold whitespace-nowrap">Information Used: </span>
                <span className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.informationUsed) }} />
              </li>
              <li className="text-sm flex gap-1">
                <span className="font-bold whitespace-nowrap">Detailed Explanation: </span>
                <span className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.detailedExplanation) }} />
              </li>
              <li className="text-sm flex gap-1">
                <span className="font-bold whitespace-nowrap">Evaluation Logic: </span>
                <span className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.evaluationLogic) }} />
              </li>
            </div>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center">No performance checklist available</p>
      )}
    </>
  );
}
