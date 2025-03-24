import Button, { ButtonProps } from '@dodao/web-core/components/core/buttons/Button';
import { isLocalhost } from '@/util/auth/isLocalhost';

export interface DisabledOnLocalhostButtonProps extends ButtonProps {
  disabledLabel?: string;
}

export default function DisabledOnLocalhostButton({
  disabledLabel = 'Disabled on Localhost',
  children,
  disabled: externalDisabled,
  ...props
}: DisabledOnLocalhostButtonProps) {
  // If on localhost, we override disabled status.
  const isLocal = isLocalhost();
  // Compute final disabled state: if it's localhost OR if external conditions are met.
  const disabled = isLocal || externalDisabled;
  return (
    <Button disabled={disabled} {...props}>
      {disabled ? disabledLabel : children}
    </Button>
  );
}
