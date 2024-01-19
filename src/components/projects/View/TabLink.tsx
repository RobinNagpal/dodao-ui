import Link from 'next/link';
import classNames from '@/utils/classNames';
import styles from './TabLink.module.scss';

interface Tab {
  name: string;
  href: string;
  current: boolean;
}

interface TabLinkProps {
  tab: Tab;
}

const TabLink: React.FC<TabLinkProps> = ({ tab }) => {
  return (
    <Link
      key={tab.name}
      href={tab.href}
      className={classNames(
        tab.current ? styles.selectedHeaderTab : 'border-transparent text hover:border-gray-300 ',
        'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
      )}
      aria-current={tab.current ? 'page' : undefined}
    >
      {tab.name}
    </Link>
  );
};

export default TabLink;
