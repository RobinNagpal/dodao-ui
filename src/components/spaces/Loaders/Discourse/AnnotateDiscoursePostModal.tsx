import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import CategoryCheckboxes from '@/components/spaces/Loaders/Discourse/CategoryCheckboxes';
import { DiscoursePost, SpaceWithIntegrationsFragment, useAnnotateDiscoursePostMutation, useChatbotCategoriesQuery } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';

export default function AnnotateDiscoursePostModal({
  open,
  onClose,
  post,
  space,
}: {
  open: boolean;
  onClose: () => void;
  post: DiscoursePost;
  space: SpaceWithIntegrationsFragment;
}) {
  const { data: categoriesResponse } = useChatbotCategoriesQuery({
    variables: {
      spaceId: space.id,
    },
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(post.categories || []);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(post.subCategories || []);

  const [enacted, setEnacted] = useState<boolean>(!!post.enacted);
  const [discussed, setDiscussed] = useState<boolean>(!!post.discussed);

  const [annotateDiscoursePostMutation] = useAnnotateDiscoursePostMutation();

  const [upserting, setUpserting] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCategories(post.categories || []);
    setSelectedSubCategories(post.subCategories || []);
    setEnacted(!!post.enacted);
    setDiscussed(!!post.discussed);
  }, [post]);

  const annotate = async () => {
    setUpserting(true);
    await annotateDiscoursePostMutation({
      variables: {
        spaceId: space.id,
        input: {
          postId: post.id,
          categories: selectedCategories,
          subCategories: selectedSubCategories,
          discussed,
          enacted,
          spaceId: space.id,
        },
      },
      refetchQueries: ['DiscoursePosts'],
    });
    onClose();
    setUpserting(false);
  };

  return (
    <FullScreenModal open={open} onClose={onClose} title="Annotate Discourse Post">
      <div className="ml-6 p-4 text-left">
        <div className="mb-6">Annotate - {post.title} </div>
        <div className="my-4">
          <div className="text-xl">Categories</div>
          <div className="text-sm text-gray-500">Select the categories that best describe this post.</div>
          <div>Selected Categories: {selectedCategories.join(', ')}</div>
          <div>Selected Sub Categories: {selectedSubCategories.join(', ')}</div>
          <div className="mt-4" />
          <CategoryCheckboxes
            categories={categoriesResponse?.chatbotCategories || []}
            setSelectedCategories={setSelectedCategories}
            setSelectedSubCategories={setSelectedSubCategories}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
          />
          <ToggleWithIcon label={'Enacted (Decision Taken?)'} enabled={enacted} setEnabled={(value) => setEnacted(value)} />
          <ToggleWithIcon label={'Discussed'} enabled={discussed} setEnabled={(value) => setDiscussed(value)} />
        </div>
        <Button disabled={false} onClick={() => annotate()} loading={false} variant="contained" primary className="mt-4">
          Annotate
        </Button>
      </div>
    </FullScreenModal>
  );
}
