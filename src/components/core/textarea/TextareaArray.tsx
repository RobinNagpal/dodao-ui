import UnstyledTextareaAutosize, { TextareaAutosizeProps } from '@/components/core/textarea/UnstyledTextareaAutosize';
import { useCallback, useEffect, useState } from 'react';

interface Props extends Omit<TextareaAutosizeProps, 'value' | 'onChange' | 'modelValue' | 'onUpdate'> {
  modelValue?: string[];
  splitArrayFunction?: (inputString: string) => string[];
  onUpdate: (modelValue: string[]) => void;
  placeholder?: string;
  className?: string;
}

function CustomTextareaAutosize({ id, modelValue = [], splitArrayFunction, onUpdate, placeholder, className }: Props) {
  const [input, setInput] = useState<string>(() => modelValue.join('\n'));

  useEffect(() => {
    setInput(modelValue.join('\n'));
  }, [modelValue]);

  const updateModel = useCallback(
    (inputString: string) => {
      const inputStrings = splitArrayFunction
        ? splitArrayFunction(inputString)
        : inputString
            .replace(/,/g, '\n')
            .replace(/;/g, '\n')
            .split('\n')
            .map((item) => item);

      if (onUpdate) {
        onUpdate(inputStrings);
      }
    },
    [splitArrayFunction, onUpdate]
  );

  return (
    <div className="border md:rounded-lg bg-skin-block-bg">
      <UnstyledTextareaAutosize
        id={id}
        modelValue={input}
        onUpdate={(e) => updateModel(e?.toString() || '')}
        placeholder={placeholder}
        className={className}
        autosize={true}
      />
    </div>
  );
}

export default CustomTextareaAutosize;
