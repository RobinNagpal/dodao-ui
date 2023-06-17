'use client';
import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import Input from '@/components/core/input/Input';
import Button from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { GitCourseInput, Space, SpaceWithIntegrationsFragment, useUpsertGitCourseMutation } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { PublishStatus } from '@/types/deprecated/models/enums';
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

  const [upsertGitCourseMutation] = useUpsertGitCourseMutation();
  const { showNotification } = useNotificationContext();

  const publishCourse = async () => {
    setGitCourseUpserting(true);
    try {
      const result = await upsertGitCourseMutation({
        variables: {
          spaceId: props.space.id,
          gitCourseInput: form,
        },
      });

      if (result.data?.payload?.title) {
        showNotification({ type: 'success', message: 'Curse Added', heading: 'Success 🎉' });
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
