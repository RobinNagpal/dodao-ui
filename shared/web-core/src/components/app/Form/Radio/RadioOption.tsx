import classNames from '@dodao/web-core/utils/classNames';
import * as Headless from '@headlessui/react';
import styles from './RadioOption.module.scss';

export interface CustomRadioOptionProps {
  optionKey: string;
  value: string;
  content: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export default function RadioOption({ optionKey, value, content, isSelected, onSelect }: CustomRadioOptionProps) {
  return (
    <Headless.RadioGroup.Option
      key={optionKey}
      value={value}
      className={({ active }) =>
        classNames(
          active ? `${styles.activeBorderColor}` : 'border-gray-300',
          `relative block cursor-pointer rounded-lg border px-6 py-4 shadow-sm focus:outline-none`
        )
      }
      onClick={() => onSelect(optionKey)}
    >
      <>
        <span className="flex items-center">
          <span className="flex flex-col text-sm">
            <Headless.RadioGroup.Label as="span" className="font-medium" dangerouslySetInnerHTML={{ __html: content }} />
          </span>
        </span>
        <span
          className={classNames(isSelected ? `${styles.selectedOption}` : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg')}
          aria-hidden="true"
        />
      </>
    </Headless.RadioGroup.Option>
  );
}
