import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import Input from '@/components/core/input/Input';
import { CompletionScreenItem } from '@/graphql/generated/generated-types';
import styled from 'styled-components';

const InputWrapper = styled.div`
  padding-bottom: 0.5rem;
`;
const LastInputWrapper = styled.div`
  padding-bottom: 0.5rem;
  border-bottom: ${'1px solid var(--border-color)'};
`;

interface UserButtonProps {
  item: CompletionScreenItem;
  updateUserInputLabel: (uuid: string, label: string) => void;
  updateUserInputLink: (uuid: string, link: string) => void;
  removeButton: (uuid: string) => void;
}

const EnabledInput = styled(Input)``;

function UserButtonInput({ item, updateUserInputLabel, updateUserInputLink, removeButton }: UserButtonProps) {
  return (
    <>
      <IconButton className="float-right my-2 mr-4" onClick={() => removeButton(item.uuid)} iconName={IconTypes.Trash} />
      <InputWrapper className="flex">
        <Input
          label="Button Label"
          maxLength={64}
          modelValue={item.label}
          onUpdate={(value: string | null | number | undefined) => updateUserInputLabel(item.uuid, value?.toString() || '')}
        />
      </InputWrapper>
      <LastInputWrapper className="flex">
        <EnabledInput
          label="Button Link"
          modelValue={item.link}
          onUpdate={(value: string | null | number | undefined) => updateUserInputLink(item.uuid, value?.toString() || '')}
        />
      </LastInputWrapper>
    </>
  );
}

export default UserButtonInput;
