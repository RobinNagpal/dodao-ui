import { PerformanceChecklistItem } from '@/types/public-equity/ticker-report-types';
import { parseMarkdown } from '@/util/parse-markdown';
import Popup from '@dodao/web-core/components/core/popup/Popup';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface ValueFlyMenuProps {
  checklistItems: PerformanceChecklistItem[];
}

export default function ValueFlyoutMenu({ checklistItems }: ValueFlyMenuProps) {
  return (
    <Popup IconComponent={InformationCircleIcon}>
      <ul className="mt-2">
        {checklistItems.map((item) => (
          <li key={item.id} className="space-y-2">
            <div className="text-sm">
              <p className="font-bold whitespace-nowrap">One-line Explanation:</p>
              <div className="markdown-body whitespace-normal break-words" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.oneLinerExplanation) }} />
            </div>
            <div className="text-sm">
              <p className="font-bold whitespace-nowrap">Information Used:</p>
              <div className="markdown-body whitespace-normal break-words" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.informationUsed) }} />
            </div>
            <div className="text-sm">
              <p className="font-bold whitespace-nowrap">Detailed Explanation:</p>
              <div className="markdown-body whitespace-normal break-words" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.detailedExplanation) }} />
            </div>
            <div className="text-sm">
              <p className="font-bold whitespace-nowrap">Evaluation Logic:</p>
              <div className="markdown-body whitespace-normal break-words" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.evaluationLogic) }} />
            </div>
          </li>
        ))}
      </ul>
    </Popup>
  );
}
