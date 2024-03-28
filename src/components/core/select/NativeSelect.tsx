import styles from './NativeSelect.module.scss';

export interface NativeSelectProps {
  showPleaseSelect?: boolean;
  selectedItemId?: string;
  items: { id: string; label: string }[];
  setSelectedItemId: (id: string) => void;
  label?: string;
  className?: string;
}

export default function NativeSelect(props: NativeSelectProps) {
  const selectedItem = props.items.find((item) => item.id === props.selectedItemId);
  const items = props.showPleaseSelect ? [{ id: undefined, label: 'Please Select' }, ...props.items] : props.items;

  return (
    <div className={`mt-2 ${props.className || ''}`}>
      <label htmlFor="location" className="block text-sm font-medium leading-6">
        {props.label}
      </label>
      <select
        id="location"
        name="location"
        className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 focus:ring-2 sm:text-sm sm:leading-6 ${styles.select}`}
        defaultValue={selectedItem?.id}
        onChange={(e) => props.setSelectedItemId(e.target.value)}
      >
        {items.map((item) => (
          <option value={item.id} key={item.id || 'please-select'} className={styles.select}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
