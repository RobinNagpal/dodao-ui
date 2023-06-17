export interface DetailsHeaderProps {
  header: string;
  subheader: string;
}
export default function DetailsHeader(props: DetailsHeaderProps) {
  return (
    <div className="px-4 sm:px-0">
      <h3 className="text-base font-semibold leading-7">{props.header}</h3>
      <p className="mt-1 max-w-2xl text-sm leading-6">{props.subheader}</p>
    </div>
  );
}
