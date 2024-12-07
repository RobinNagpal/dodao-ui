// Import necessary libraries and components
import Button from '@dodao/web-core/components/core/buttons/Button';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import RobotIconSolid from '@dodao/web-core/components/core/icons/RobotIconSolid';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import DocumentPlusIcon from '@heroicons/react/24/solid/DocumentPlusIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import styled from 'styled-components';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid';

// Define component's props using TypeScript interfaces
interface IconButtonProps {
  disabled?: boolean;
  iconName: IconTypes;
  primary?: boolean;
  variant?: 'outlined' | 'contained' | 'text';
  loading?: boolean;
  type?: string;
  height?: string;
  width?: string;
  removeBorder?: boolean;
  onClick?: () => void;
  className?: string;
}

// Create the Styled Components
const StyledUiButton = styled(Button)<{ className?: string }>`
  border: none;

  svg {
    color: ${({ className }) => (className?.toLowerCase().includes('color') ? '' : 'var(--text-color)')};
  }
`;

// IconButton component
function IconButton({
  disabled = false,
  iconName,
  primary = false,
  variant = 'outlined',
  loading = false,
  type,
  height = '20',
  width = '20',
  removeBorder = false,
  onClick,
  className,
  tooltip,
}: IconButtonProps & { tooltip?: string }) {
  const renderIcon = () => {
    switch (iconName) {
      case IconTypes.Trash:
        return <TrashIcon width={width} height={height} />;
      case IconTypes.Edit:
        return <PencilSquareIcon width={width} height={height} />;
      case IconTypes.MoveUp:
        return <ArrowUpIcon width={width} height={height} />;
      case IconTypes.MoveDown:
        return <ArrowDownIcon width={width} height={height} />;
      case IconTypes.GuideAddIcon:
        return <DocumentPlusIcon width={width} height={height} />;
      case IconTypes.ArrowDownTrayIcon:
        return <ArrowDownTrayIcon width={width} height={height} />;
      case IconTypes.Reload:
        return <ArrowPathIcon width={width} height={height} />;
      case IconTypes.RobotIconSolid:
        return <RobotIconSolid />;
      case IconTypes.PlusIcon:
        return <PlusIcon width={width} height={height} />;
      case IconTypes.Refresh:
        return <ArrowPathIcon width={width} height={height} />;
      default:
        return null;
    }
  };

  return (
    <div title={tooltip} onClick={disabled ? undefined : onClick}>
      <StyledUiButton
        disabled={disabled}
        primary={!!primary}
        variant={variant}
        loading={loading}
        removeBorder={removeBorder}
        onClick={disabled ? undefined : onClick}
        className={className}
      >
        {renderIcon()}
      </StyledUiButton>
    </div>
  );
}

export default IconButton;
