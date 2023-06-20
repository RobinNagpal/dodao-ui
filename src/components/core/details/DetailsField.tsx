export interface DetailsFieldProps {
  label: string;
  value: string;
}

export default function DetailsField(props: DetailsFieldProps) {
  return (
    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm font-medium leading-6">{props.label}</dt>
      <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">{props.value}</dd>
    </div>
  );
}
