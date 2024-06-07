import { IconMistOff, IconPlus } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Search from '@/chatbot/components/Search';

interface Props<T> {
  isOpen: boolean;
  addItemButtonTitle: string;
  side: 'left' | 'right';
  items: T[];
  itemComponent: ReactNode;
  footerComponent?: ReactNode;
  searchTerm: string;
  handleSearchTerm: (searchTerm: string) => void;
  toggleOpen: () => void;
  handleCreateItem: () => void;
  handleDrop: (e: any) => void;
}

const Sidebar = <T,>({
  addItemButtonTitle,
  side,
  items,
  itemComponent,
  footerComponent,
  searchTerm,
  handleSearchTerm,

  handleCreateItem,
  handleDrop,
}: Props<T>) => {
  const { t } = useTranslation('promptbar');

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  return (
    <div>
      <div className={`${side}-24 z-40 flex h-full w-[260px] flex-none flex-col space-y-2 p-8 text-[14px] transition-all sm:relative`}>
        <div className="flex items-center">
          <button
            className="text-sidebar flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center gap-3 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={() => {
              handleCreateItem();
              handleSearchTerm('');
            }}
          >
            <IconPlus size={16} />
            {addItemButtonTitle}
          </button>
        </div>
        <Search placeholder={t('Search...') || ''} searchTerm={searchTerm} onSearch={handleSearchTerm} />

        <div className="flex-grow overflow-auto">
          {items?.length > 0 ? (
            <div className="pt-2" onDrop={handleDrop} onDragOver={allowDrop} onDragEnter={highlightDrop} onDragLeave={removeHighlight}>
              {itemComponent}
            </div>
          ) : (
            <div className="mt-8 select-none text-center text-white opacity-50">
              <IconMistOff className="mx-auto mb-3" />
              <span className="text-[14px] leading-normal">{t('No data.')}</span>
            </div>
          )}
        </div>
        {footerComponent}
      </div>
    </div>
  );
};

export default Sidebar;
