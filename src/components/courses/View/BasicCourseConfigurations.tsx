import UpsertRawCourseModal from '@/components/app/Modal/Course/UpsertRawCourseModal';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  SpaceWithIntegrationsFragment,
  useRawGitCourseQuery,
  useRefreshGitCourseMutation,
  useUpsertGitCourseMutation,
} from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { isSuperAdmin } from '@/utils/auth/superAdmins';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export interface BasicCourseConfigurationsProps {
  space: SpaceWithIntegrationsFragment;
  courseKey: string;
}
export default function BasicCourseConfigurations({ space, courseKey }: BasicCourseConfigurationsProps) {
  const { data: session } = useSession();
  const isUserASuperAdmin = session && isSuperAdmin(session as Session);

  const [refreshGitCourseMutation] = useRefreshGitCourseMutation();
  const [upsertGitCourseMutation] = useUpsertGitCourseMutation();

  const [showUpsertRawCourseModal, setShowUpsertRawCourseModal] = useState(false);

  const { showNotification } = useNotificationContext();
  const { data: rawGitCourse, refetch: refetchRawCourse } = useRawGitCourseQuery({
    variables: {
      spaceId: space.id,
      key: courseKey,
    },
  });

  function editRawCourseInfo() {
    setShowUpsertRawCourseModal(true);
  }

  async function refreshCourse() {
    await refreshGitCourseMutation({
      variables: {
        spaceId: space.id,
        courseKey: courseKey,
      },
    });
    showNotification({ type: 'success', message: 'Course refreshed successfully' });
  }

  const selectFromThreedotDropdown = (e: string) => {
    if (e === 'editRawCourseInfo') editRawCourseInfo();
    if (e === 'refreshCourse') refreshCourse();
  };

  const threeDotItems = [
    { label: 'Edit Raw Course Info', key: 'editRawCourseInfo' },
    { label: 'Refresh', key: 'refreshCourse' },
  ];

  return isUserASuperAdmin ? (
    <div className="pull-right float-right mr-2 topnav-domain-navigation-three-dots">
      <EllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} />
      {showUpsertRawCourseModal && (
        <UpsertRawCourseModal
          open={showUpsertRawCourseModal}
          onClose={() => setShowUpsertRawCourseModal(false)}
          rawGitCourse={rawGitCourse?.payload}
          onUpsertRawCourse={async (repoUrl: string, publishStatus: PublishStatus, weight: number) => {
            const result = await upsertGitCourseMutation({
              variables: {
                spaceId: space.id,
                gitCourseInput: {
                  courseRepoUrl: repoUrl,
                  publishStatus,
                  weight,
                },
              },
            });
            const payload = result.data?.payload;
            if (payload) {
              showNotification({ type: 'success', message: 'Course added successfully' });
              setShowUpsertRawCourseModal(false);
            } else {
              showNotification({ type: 'error', message: 'Failed to add course' });
            }
          }}
        />
      )}
    </div>
  ) : null;
}
