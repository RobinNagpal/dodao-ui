'use client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import getProtocol from '@dodao/web-core/utils/api/getProtocol';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useState } from 'react';

interface CreateSpaceProps {
  upserting: boolean;
  onSubmit: (spaceData: { id: string; name: string }) => Promise<void>;
  createdSpace?: WebCoreSpace;
}

function CreateNewSpace({ upserting, onSubmit, createdSpace }: CreateSpaceProps) {
  const [project, setProject] = useState('');

  return (
    <div>
      {createdSpace ? (
        <FullPageModal open={true} onClose={() => {}} title={''}>
          <div className="flex flex-col items-center p-8 rounded-lg shadow-md pb-16">
            <div className="text-center">
              <h1 className="text-xl font-semibold">Space Created Successfully</h1>
              <p className="mt-4 text-md">
                Your space is created. Click{' '}
                <a
                  href={`${getProtocol()}://${slugify(project)}.${window.location.hostname}:${window.location.port}/spaces/finish-space-setup`}
                  className="text-blue-500 underline"
                  rel="noopener noreferrer"
                >
                  here
                </a>{' '}
                to go to your space
              </p>
            </div>
          </div>
        </FullPageModal>
      ) : (
        <section className="h-full flex items-center justify-center pt-36" style={{ backgroundColor: 'var(--bg-color)' }}>
          <div className="w-[600px]">
            <div className="p-6">
              <div className="space-y-12 text-left p-6">
                <div className="">
                  <h2 className="font-semibold leading-7 text-3xl text-center pb-8">Create Space</h2>
                  <Input label="Project Name" modelValue={project} onUpdate={(value) => setProject(value?.toString() || '')} />
                </div>
              </div>
              <div className="p-6 flex items-center justify-end gap-x-6">
                <Button
                  variant="contained"
                  primary
                  loading={upserting}
                  onClick={async () => {
                    await onSubmit({
                      id: slugify(project),
                      name: project,
                    });
                  }}
                >
                  Create Space
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default CreateNewSpace;
