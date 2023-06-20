import styled from 'styled-components';
import Input from '@/components/core/input/Input';

interface UserInputProps {
  label: string;
  required: boolean;
  modelValue?: string | number | null;
  setUserInput: (value: string) => void;
}

const StyledUiInput = styled(Input)`
  &.mt-4 {
    margin-top: 1rem;
  }
`;

function UserInput({ modelValue, label, required, setUserInput }: UserInputProps) {
  return (
    <StyledUiInput modelValue={modelValue} maxLength={64} className="mt-4" onUpdate={(value?: string | number) => setUserInput(value?.toString() || '')}>
      <label>
        {label} {required ? '*' : ''}
      </label>
    </StyledUiInput>
  );
}

export default UserInput;
