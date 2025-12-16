import { PortfolioManagerType } from '@/types/portfolio-manager';
import { ComponentType } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/type/[type]/route';
import ProfileGrid from '@/components/portfolios/ProfileGrid';
import PortfolioManagersPageActions from '@/components/portfolios/PortfolioManagersPageActions';

interface PortfolioManagersPageComponentProps {
  profiles: PortfolioManagerProfileWithUser[];
  managerType: PortfolioManagerType;
  title: string;
  icon?: ComponentType<{ className?: string }>;
  emptyStateTitle: string;
  emptyStateDescription: string;
  showCollegeAmbassadorBadge?: boolean;
}

export default function PortfolioManagersPageComponent({
  profiles,
  managerType,
  title,
  icon: Icon,
  emptyStateTitle,
  emptyStateDescription,
  showCollegeAmbassadorBadge = false,
}: PortfolioManagersPageComponentProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="pt-2 pb-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {Icon && <Icon className="w-8 h-8 text-blue-500" />}
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <div className="ml-auto">
              <PortfolioManagersPageActions managerType={managerType} />
            </div>
          </div>
          <p className="text-gray-400 text-base ml-11">
            Discover {profiles.length} professional portfolio manager{profiles.length !== 1 ? 's' : ''} and explore their profiles and portfolios
          </p>
        </div>

        {/* Portfolio Managers Grid */}
        <ProfileGrid
          profiles={profiles}
          emptyStateConfig={{
            icon: Icon || (() => null),
            title: emptyStateTitle,
            description: emptyStateDescription,
          }}
          showCollegeAmbassadorBadge={showCollegeAmbassadorBadge}
        />
      </div>
    </div>
  );
}
