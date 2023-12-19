import { RadioGroup } from '@headlessui/react';
import styles from './NewRadioButton.module.scss';

export interface CustomRadioOptionProps {
  key: string;
  value: string;
  content: string;
  isSelected: boolean;
}

function classNames(...classes: (string | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
export const CustomRadioOption: React.FC<CustomRadioOptionProps> = ({ key, value, content, isSelected }) => {
  return (
    <RadioGroup.Option
      key={key}
      value={value}
      className={({ active }) =>
        classNames(
          active ? `${styles.activeBorderColor}` : 'border-gray-300',
          `relative block cursor-pointer rounded-lg border px-6 py-4 shadow-sm focus:outline-none ${styles.backgroundColor}`
        )
      }
    >
      {() => (
        <>
          <span className="flex items-center">
            <span className="flex flex-col text-sm">
              <RadioGroup.Label as="span" className="font-medium" dangerouslySetInnerHTML={{ __html: content }} />
            </span>
          </span>
          <span
            className={classNames(isSelected ? `${styles.selectedBorderColor}` : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg')}
            aria-hidden="true"
          />
        </>
      )}
    </RadioGroup.Option>
  );
};
