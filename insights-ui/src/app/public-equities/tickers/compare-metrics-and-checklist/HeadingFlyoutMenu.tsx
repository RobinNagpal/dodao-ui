import { parseMarkdown } from '@/util/parse-markdown';
import Popup from '@dodao/web-core/components/core/popup/Popup';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface HeadingFlyMenuProps {
  description: string;
}

export default function HeadingFlyoutMenu({ description }: HeadingFlyMenuProps) {
  return (
    <Popup IconComponent={InformationCircleIcon}>
      <div className="markdown-body whitespace-normal break-words font-normal" dangerouslySetInnerHTML={{ __html: parseMarkdown(description) }} />
    </Popup>
  );
}
