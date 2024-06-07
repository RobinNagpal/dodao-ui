import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';

export interface InputWithButtonProps {
  inputLabel: string;
  inputPlaceholder?: string;
  buttonLabel: string;
  onButtonClick: () => void;
  loading?: boolean;
  inputModelValue: string | number | null;
  onInputUpdate: (value: string | number | undefined) => void;
}
export function InputWithButton({ inputLabel, buttonLabel, onButtonClick, loading, inputPlaceholder, inputModelValue, onInputUpdate }: InputWithButtonProps) {
  return (
    <div className="flex w-full items-end mt-2">
      <Input label={inputLabel} onUpdate={onInputUpdate} modelValue={inputModelValue} className="grow" disabled={loading} placeholder={inputPlaceholder} />
      <Button onClick={onButtonClick} className="ml-2 grow-0" variant="contained" primary loading={loading}>
        {buttonLabel}
      </Button>
    </div>
  );
}
