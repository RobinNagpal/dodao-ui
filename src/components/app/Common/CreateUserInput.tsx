import SidebarButton from '@/components/core/buttons/SidebarButton';
import Checkbox from '@/components/app/Form/Checkbox';
import Icon from '@/components/app/Icon';
import Input from '@/components/core/input/Input';
import { InputType } from '@/types/deprecated/models/enums';
import { GuideStepItem, UserInput } from '@/types/deprecated/models/GuideModel';
import styled from 'styled-components';

interface UserInputProps {
  removeUserInput: (uuid: string) => void;
  item: GuideStepItem;
  userInputErrors?: any;
  updateUserInputLabel: (uuid: string, label: string) => void;
  updateUserInputPrivate: (uuid: string, value: boolean) => void;
  updateUserInputRequired: (uuid: string, value: boolean) => void;
}

const InputWrapper = styled.div<{ error: boolean }>`
  padding-bottom: 0.5rem;
  border-bottom: ${(props) => (props.error ? '2px solid red' : '1px solid var(--border-color)')};
`;

const EnabledInput = styled(Input)``;

function UserInputComponent({ removeUserInput, item, userInputErrors, updateUserInputLabel, updateUserInputPrivate, updateUserInputRequired }: UserInputProps) {
  const userInput = item as UserInput;

  return (
    <>
      <SidebarButton className="float-right my-2 mr-4" onClick={() => removeUserInput(userInput.uuid)}>
        <Icon size="20" className="link-color" name="close" />
      </SidebarButton>

      <InputWrapper className="flex" error={userInputErrors?.label}>
        <EnabledInput
          label="User Input Label"
          maxLength={64}
          modelValue={userInput.label}
          onUpdate={(value: string | null | number | undefined) => updateUserInputLabel(userInput.uuid, value ? value.toString() : '')}
        />
      </InputWrapper>
      <div className="flex mt-2">
        <Checkbox
          isChecked={userInput.required}
          onChange={(value: boolean) => updateUserInputRequired(userInput.uuid, value)}
          id={`required-${userInput.uuid}`}
          labelContent={'Required'}
        />
      </div>
      <div className="flex mt-2">
        <Checkbox
          isChecked={userInput.type === InputType.PrivateShortInput}
          onChange={(value: boolean) => updateUserInputPrivate(userInput.uuid, value)}
          id={`private-${userInput.uuid}`}
          labelContent={'Private'}
        />
      </div>
    </>
  );
}

export default UserInputComponent;
