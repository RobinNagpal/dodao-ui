import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import { useState } from 'react';

export interface InputWithButtonProps {
  inputLabel: string;
  inputPlaceholder?: string;
  buttonLabel: string;
  onButtonClick: (inputValue: string) => void;
  loading?: boolean;
}
export function InputWithButton({ inputLabel, buttonLabel, onButtonClick, loading, inputPlaceholder }: InputWithButtonProps) {
  const [inputText, setInputText] = useState<string>('');
  return (
    <div className="flex w-full items-end mt-2">
      <Input
        label={inputLabel}
        onUpdate={(v) => setInputText(v?.toString() || '')}
        modelValue={inputText}
        className="grow"
        disabled={loading}
        placeholder={inputPlaceholder}
      />
      <Button onClick={() => onButtonClick(inputText)} className="ml-2 grow-0" variant="contained" primary loading={loading}>
        {buttonLabel}
      </Button>
    </div>
  );
}
