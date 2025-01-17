import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import styles from './CallToActionButtonForm.module.scss';

export interface CompletionScreenItem {
  label: string;
  link: string;
  uuid: string;
}

interface UserButtonProps {
  item: CompletionScreenItem;
  updateUserInputLabel: (uuid: string, label: string) => void;
  updateUserInputLink: (uuid: string, link: string) => void;
  removeButton: (uuid: string) => void;
}

function CallToActionButtonForm({ item, updateUserInputLabel, updateUserInputLink, removeButton }: UserButtonProps) {
  return (
    <>
      <IconButton className="float-right my-2 mr-4" onClick={() => removeButton(item.uuid)} iconName={IconTypes.Trash} />
      <div className={'flex ' + styles.InputWrapper}>
        <Input
          label="Button Label"
          maxLength={64}
          modelValue={item.label}
          onUpdate={(value: string | null | number | undefined) => updateUserInputLabel(item.uuid, value?.toString() || '')}
        />
      </div>
      <div className={'flex ' + styles.LastInputWrapper}>
        <Input
          label="Button Link"
          modelValue={item.link}
          onUpdate={(value: string | null | number | undefined) => updateUserInputLink(item.uuid, value?.toString() || '')}
        />
      </div>
    </>
  );
}

export default CallToActionButtonForm;
