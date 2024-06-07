import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { ChatbotSubCategoryHelperFunctions } from '@/components/spaces/Loaders/Categories/useEditChatbotCategory';
import { ChatbotSubCategoryFragment } from '@/graphql/generated/generated-types';
import React from 'react';

interface UpsertChatbotCategoryModalProps {
  subCategory: ChatbotSubCategoryFragment | null;
  subCategoryHelperFunctions: ChatbotSubCategoryHelperFunctions;
  open: boolean;
  onClose: () => void;
}

export default function UpsertChatbotSubCategoryModal(props: UpsertChatbotCategoryModalProps) {
  const [chatbotSubCategory, setChatbotSubCategory] = React.useState<ChatbotSubCategoryFragment>(
    props.subCategory || {
      key: '',
      name: '',
      description: '',
    }
  );

  function setChatbotCategoryField(field: keyof ChatbotSubCategoryFragment, value: any) {
    setChatbotSubCategory((prev) => {
      return {
        ...prev,
        [field]: value,
      };
    });
  }
  return (
    <FullPageModal open={props.open} onClose={props.onClose} title={'Upsert Sub Category'}>
      <div className="project-y-12 text-left px-6">
        <div className="border-b pb-12">
          <Input
            label="Key"
            modelValue={chatbotSubCategory.key}
            disabled={!!props.subCategory}
            onUpdate={(value) => setChatbotCategoryField('key', value?.toString() || '')}
          />
          <Input label="Name" modelValue={chatbotSubCategory.name} onUpdate={(value) => setChatbotCategoryField('name', value?.toString() || '')} />
          <Input
            label="Description"
            modelValue={chatbotSubCategory.description}
            onUpdate={(value) => setChatbotCategoryField('description', value?.toString() || '')}
          />
        </div>
      </div>
      <div className="flex pt-8 px-6">
        <Button
          className="mr-4"
          onClick={() => {
            props.onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          primary
          onClick={() => {
            props.subCategoryHelperFunctions.upsertChatbotSubCategory(chatbotSubCategory);
            props.onClose();
          }}
          disabled={props.subCategoryHelperFunctions.isSubCategoryValid(chatbotSubCategory)}
        >
          Save
        </Button>
      </div>
    </FullPageModal>
  );
}
