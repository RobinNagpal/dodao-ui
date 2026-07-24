import { BsPlus } from '@react-icons/all-files/bs/BsPlus';
import { FormContextType, IconButtonProps, RJSFSchema, StrictRJSFSchema, TranslatableString } from '@rjsf/utils';

export default function AddButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  uiSchema,
  registry,
  ...props
}: IconButtonProps<T, S, F>) {
  const { translateString } = registry;
  return (
    <button
      {...props}
      style={{ width: '100%' }}
      className={`ml-1 grid justify-items-center bg-primary px-4 py-2 text-base font-normal text-primary-text ${props.className}`}
      title={translateString(TranslatableString.AddItemButton)}
    >
      <BsPlus />
    </button>
  );
}
