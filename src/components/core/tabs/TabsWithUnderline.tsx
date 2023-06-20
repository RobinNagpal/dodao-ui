import NativeSelect from '@/components/core/select/NativeSelect';
import classNames from '@/utils/classNames';
import styled from 'styled-components';

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

const StyledNav = styled.nav`
  border: 1px solid #e5e7eb;
`;

const BottomSpan = styled.span<{ isSelected: boolean }>`
  border-bottom: 3px solid ${(props) => (props.isSelected ? 'var(--primary-color)' : 'transparent')};
`;
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
        <StyledNav className="isolate flex divide-x divide-gray-200 rounded-lg shadow" aria-label="Tabs">
          {props.tabs.map((tab, tabIdx) => {
            const isSelected = tab.id === props.selectedTabId;
            return (
              <a
                key={tab.label}
                href={tab.href}
                className={classNames(
                  tabIdx === 0 ? 'rounded-l-lg' : '',
                  tabIdx === props.tabs.length - 1 ? 'rounded-r-lg' : '',
                  'group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium focus:z-10'
                )}
                aria-current={isSelected ? 'page' : undefined}
                onClick={() => props.setSelectedTabId(tab.id)}
              >
                <span>{tab.label}</span>
                <BottomSpan aria-hidden="true" isSelected={isSelected} className="absolute inset-x-0 bottom-0 h-0.5" />
              </a>
            );
          })}
        </StyledNav>
      </div>
    </div>
  );
}
