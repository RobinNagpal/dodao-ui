import NativeSelect from '@/components/core/select/NativeSelect';
import classNames from '@/utils/classNames';
import styles from './TabsWithUnderline.module.scss';

export interface TabItem {
  id: string;
  label: string;
  href?: string;
}

export interface TabsWithUnderlineProps {
  selectedTabId: string;
  setSelectedTabId: (id: string) => void;
  tabs: TabItem[];
  className?: string;
}

export default function TabsWithUnderline(props: TabsWithUnderlineProps) {
  return (
    <div className={props.className || ''}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <NativeSelect selectedItemId={props.selectedTabId} items={props.tabs} setSelectedItemId={props.setSelectedTabId} />
      </div>
      <div className="hidden sm:block">
        <nav className={`isolate flex divide-x divide-gray-200 rounded-lg shadow ${styles.styledNav}`} aria-label="Tabs">
          {props.tabs.map((tab, tabIdx) => {
            const isSelected = tab.id === props.selectedTabId;
            return (
              <a
                key={tab.label}
                href={tab.href}
                className={classNames(
                  tabIdx === 0 ? 'rounded-l-lg' : '',
                  tabIdx === props.tabs.length - 1 ? 'rounded-r-lg' : '',
                  'group relative flex-grow overflow-hidden text-center text-sm font-medium focus:z-10 whitespace-nowrap',
                  isSelected ? 'z-10' : 'z-0',
                  'flex-basis-0 px-4 py-2'
                )}
                aria-current={isSelected ? 'page' : undefined}
                onClick={() => props.setSelectedTabId(tab.id)}
              >
                <span>{tab.label}</span>
                <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 ${styles.bottomSpan} ${isSelected ? styles.selected : ''}`} />
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
