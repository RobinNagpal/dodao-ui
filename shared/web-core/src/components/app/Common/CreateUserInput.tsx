import Checkbox from '@dodao/web-core/components/app/Form/Checkbox';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import { InputType } from '@dodao/web-core/types/deprecated/models/enums';
import { GuideStepItem, UserInput } from '@dodao/web-core/types/deprecated/models/GuideModel';
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
      <IconButton className="float-right my-2 mr-4" onClick={() => removeUserInput(userInput.uuid)} iconName={IconTypes.Trash} />

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
