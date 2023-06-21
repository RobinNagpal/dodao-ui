import TextareaAutosize, { TextareaAutosizeProps } from '@/components/core/textarea/TextareaAutosize';
import { useCallback, useEffect, useState } from 'react';

interface Props extends Omit<TextareaAutosizeProps, 'value' | 'onChange' | 'modelValue' | 'onUpdate'> {
  modelValue?: string[];
  splitArrayFunction?: (inputString: string) => string[];
  onUpdate: (modelValue: string[]) => void;
  placeholder?: string;
  className?: string;
}

function CustomTextareaAutosize({ id, modelValue = [], splitArrayFunction, onUpdate, placeholder, className, label }: Props) {
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
    <div className="mt-2">
      <TextareaAutosize
        label={label}
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
