import { FullCriterionEvaluation } from '@/types/public-equity/ticker-report-types';

export default function PerformanceChecklistEvaluation({ criterion }: { criterion?: FullCriterionEvaluation }) {
  return (
    <>
      {criterion?.performanceChecklistEvaluation?.performanceChecklistItems?.length ? (
        <ul className="list-disc mt-2">
          {criterion.performanceChecklistEvaluation.performanceChecklistItems.map((item, index) => (
            <div key={index + '_performance_checklist_' + criterion.criterionKey} className="mb-3">
              <li className="flex items-start">
                <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                <span className="font-bold">{item.checklistItem}</span>
              </li>
              <div className="text-sm">
                <span className="font-bold">One-line Explanation :</span>
                {item.oneLinerExplanation}
              </div>
              <div className="text-sm">
                <span className="font-bold">Information Used :</span>
                {item.informationUsed}
              </div>
              <div className="text-sm">
                <span className="font-bold">Detailed Explanation :</span>
                {item.detailedExplanation}
              </div>
              <div className="text-sm">
                <span className="font-bold">Evaluation Logic :</span>
                {item.evaluationLogic}
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
