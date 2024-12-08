import { useEditTweetCollection } from "@/components/tweetCollection/TweetCollections/useEditTweetCollection";
import SingleCardLayout from "@/layouts/SingleCardLayout";
import { TweetCollectionSummary } from "@/types/tweetCollections/tweetCollection";
import Button from "@dodao/web-core/components/core/buttons/Button";
import Input from "@dodao/web-core/components/core/input/Input";
import FullScreenModal from "@dodao/web-core/components/core/modals/FullScreenModal";
import PageWrapper from "@dodao/web-core/components/core/page/PageWrapper";
import React from "react";
import UpsertBadgeInput from "@dodao/web-core/components/core/badge/UpsertBadgeInput";
import union from "lodash/union";

interface TweetCollectionEditorProps {
  tweetCollection?: TweetCollectionSummary;
  onClose: () => void;
}

export default function TweetCollectionEditModal(
  props: TweetCollectionEditorProps
) {
  const { isPrestine, loading, tweetCollection, helperFunctions } =
    useEditTweetCollection({
      tweetCollection: props.tweetCollection,
    });

  return (
    <FullScreenModal
      open={true}
      onClose={props.onClose}
      title={
        props.tweetCollection
          ? `Edit - ${tweetCollection.name}`
          : "Create Tweet Collection"
      }
    >
      <div className="text-left">
        <PageWrapper>
          <SingleCardLayout>
            <PageWrapper>
              <div className="text-color">
                <Input
                  modelValue={tweetCollection.name}
                  onUpdate={(v) =>
                    helperFunctions.updateTweetCollectionName(
                      v?.toString() || ""
                    )
                  }
                  label="Name *"
                  required
                  error={
                    isPrestine || tweetCollection.name.trim()
                      ? false
                      : "Name is Required"
                  }
                />

                <Input
                  modelValue={tweetCollection.description}
                  onUpdate={(v) =>
                    helperFunctions.updateTweetCollectionDescription(
                      v?.toString() || ""
                    )
                  }
                  label="Description *"
                  required
                  error={
                    isPrestine || tweetCollection.description.trim()
                      ? false
                      : "Description is Required"
                  }
                />

                <UpsertBadgeInput
                  label={"Handles"}
                  badges={tweetCollection.handles.map((d) => ({
                    id: d,
                    label: d,
                  }))}
                  onAdd={(v) => {
                    helperFunctions.updateTweetCollectionHandles(
                      union(tweetCollection.handles, [v])
                    );
                  }}
                  onRemove={(v) => {
                    helperFunctions.updateTweetCollectionHandles(
                      tweetCollection.handles.filter((handle) => handle !== v)
                    );
                  }}
                />

                <div className="mt-10 flex justify-center items-center">
                  <Button
                    variant="contained"
                    primary
                    loading={loading}
                    disabled={loading}
                    onClick={() => {
                      helperFunctions.upsertTweetCollection();
                      props.onClose();
                    }}
                  >
                    {props.tweetCollection ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </PageWrapper>
          </SingleCardLayout>
        </PageWrapper>
      </div>
    </FullScreenModal>
  );
}
