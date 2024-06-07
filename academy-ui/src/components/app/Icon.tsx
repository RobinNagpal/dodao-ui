export interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
}
function Icon({ name, size }: IconProps) {
  return (
    <i
      className={`iconfont icon${name}`}
      style={
        size
          ? {
              fontSize: `${size}px`,
              lineHeight: `${size}px`,
              color: 'var(--text-color)',
            }
          : {}
      }
    />
  );
}

export default Icon;
