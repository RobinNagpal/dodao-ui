import Input from '@dodao/web-core/components/core/input/Input';
import styles from './UserInput.module.scss';

interface UserInputProps {
  label: string;
  required: boolean;
  modelValue?: string | number | null;
  setUserInput: (value: string) => void;
}

function UserInput({ modelValue, label, required, setUserInput }: UserInputProps) {
  return (
    <Input
      modelValue={modelValue}
      maxLength={64}
      className={`mt-4 ${styles.userInput}`}
      onUpdate={(value?: string | number) => setUserInput(value?.toString() || '')}
    >
      <label>
        {label} {required ? '*' : ''}
      </label>
    </Input>
  );
}

export default UserInput;
