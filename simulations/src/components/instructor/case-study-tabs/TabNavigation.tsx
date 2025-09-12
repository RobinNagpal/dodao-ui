import { FC } from 'react';
import { BookOpen, Users, BarChart3 } from 'lucide-react';

export type TabType = 'overview' | 'students' | 'analytics';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-white/20">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('overview')}
          className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
            activeTab === 'overview'
              ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
              : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => onTabChange('students')}
          className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
            activeTab === 'students'
              ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
              : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Students</span>
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
            activeTab === 'analytics'
              ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
              : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;
