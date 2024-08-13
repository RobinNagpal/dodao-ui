'use client';
import withSpace from '@/contexts/withSpace';
import { GitCourseInput, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { PublishStatus } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const AddCourse = (props: { space: SpaceWithIntegrationsFragment }) => {
  const [gitCourseUpserting, setGitCourseUpserting] = useState(false);
  const [form, setForm] = useState<GitCourseInput>({
    weight: 20,
    publishStatus: PublishStatus.Live,
    courseRepoUrl: '',
  });
  const router = useRouter();
  const { $t: t } = useI18();

  const { showNotification } = useNotificationContext();

  const publishCourse = async () => {
    setGitCourseUpserting(true);
    try {
      // This logic won't work, need to implement the backend correctly
      const response = await fetch(`${getBaseUrl()}/api/courses/some-course-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: props.space.id,
          gitCourseInput: form,
        }),
      });

      const result = await response.json();

      if (result.data?.course?.title) {
        showNotification({ type: 'success', message: 'Course Added', heading: 'Success 🎉' });
        router.push(`/courses/view/${result.data?.payload.key}`);
      }
    } catch {
      showNotification({ type: 'error', message: t('notify.somethingWentWrong') });
    }
    setGitCourseUpserting(false);
  };

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="px-4 md:px-0 overflow-hidden">
          <Link href="/courses" className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            Back to Courses
          </Link>
          <Block title={t('courses.create.basicInfo')} className="mt-4">
            <div className="mb-2">
              <Input modelValue={form.courseRepoUrl} maxLength={1024} onUpdate={(e) => setForm({ ...form, courseRepoUrl: e?.toString() || '' })}>
                {t('courses.create.courseRepoUrl')}
              </Input>
            </div>
          </Block>
          <Button onClick={publishCourse} loading={gitCourseUpserting} disabled={gitCourseUpserting} className="block w-full" variant="contained" primary>
            Publish
          </Button>
        </div>
      </SingleCardLayout>
    </PageWrapper>
  );
};

export default withSpace(AddCourse);
