import styled from 'styled-components';
import Input from '../Input';

interface InputProps {
  uuid: string;
  label: string;
  required: boolean;
}

interface UserInputProps {
  modelValue?: string | number | null;
  userInput: InputProps;
  setUserInput: (uuid: string, value: string) => void;
}

const StyledUiInput = styled(Input)`
  &.mt-4 {
    margin-top: 1rem;
  }
`;

function UserInput({ modelValue, userInput, setUserInput }: UserInputProps) {
  return (
    <StyledUiInput
      modelValue={modelValue}
      maxLength={64}
      className="mt-4"
      onUpdate={(value?: string | number) => setUserInput(userInput.uuid, value?.toString() || '')}
    >
      <label>
        {userInput.label} {userInput.required ? '*' : ''}
      </label>
    </StyledUiInput>
  );
}

export default UserInput;
