export interface NativeSelectProps {
  showPleaseSelect?: boolean;
  selectedItemId: string;
  items: { id: string; label: string }[];
  setSelectedItemId: (id: string) => void;
}

export default function NativeSelect(props: NativeSelectProps) {
  const selectedItem = props.items.find((item) => item.id === props.selectedItemId);
  const items = props.showPleaseSelect ? [{ id: undefined, label: 'Please Select' }, ...props.items] : props.items;

  return (
    <div>
      <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
        Location
      </label>
      <select
        id="location"
        name="location"
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        defaultValue={selectedItem?.label}
        onChange={(e) => props.setSelectedItemId(e.target.value)}
      >
        {items.map((item) => (
          <option value={item.id} key={item.id || 'please-select'}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
