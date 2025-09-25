import { getLegendItems } from '@/util/radar-chart-utils';
import Popup from '@dodao/web-core/components/core/popup/Popup';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function SpiderChartFlyoutMenu() {
  const ranges = getLegendItems();
  return (
    <Popup IconComponent={InformationCircleIcon} IconClasses="size-6" IconButtonTitle={'Spider Chart Legend'}>
      <div className="font-semibold">
        Color Scheme is based on the <br></br>Overall Score Percentage:
        <ul className="mx-8 mt-2 space-y-2">
          {ranges.map(({ label, style }) => (
            <li key={label} className="flex items-center justify-between">
              <div>{label}</div>
              <div className="w-8 h-4 border rounded-sm" style={style} />
            </li>
          ))}
        </ul>
      </div>
    </Popup>
  );
}
