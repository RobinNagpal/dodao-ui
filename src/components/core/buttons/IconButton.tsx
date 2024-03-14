// Import necessary libraries and components
import Button from '@/components/core/buttons/Button';
import { IconTypes } from '@/components/core/icons/IconTypes';
import RobotIconSolid from '@/components/core/icons/RobotIconSolid';
import PencilSquareIcon from '@heroicons/react/24/outline/PencilSquareIcon';
import ArrowSmallDownIcon from '@heroicons/react/24/solid/ArrowSmallDownIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ArrowSmallUpIcon from '@heroicons/react/24/solid/ArrowSmallUpIcon';
import DocumentPlusIcon from '@heroicons/react/24/solid/DocumentPlusIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import styled from 'styled-components';

// Define component's props using TypeScript interfaces
interface IconButtonProps {
  disabled?: boolean;
  iconName: IconTypes;
  primary?: boolean;
  variant?: 'outlined' | 'contained' | 'text';
  loading?: boolean;
  type?: string;
  size?: string;
  removeBorder?: boolean;
  onClick?: () => void;
  className?: string;
}

// Create the Styled Components
const StyledUiButton = styled(Button)`
  border: none;

  svg {
    color: var(--text-color);
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
  size,
  removeBorder = false,
  onClick,
  className,
}: IconButtonProps) {
  const renderIcon = () => {
    switch (iconName) {
      case IconTypes.Trash:
        return <TrashIcon width="20" height="20" />;
      case IconTypes.Edit:
        return <PencilSquareIcon width="20" height="20" />;
      case IconTypes.MoveUp:
        return <ArrowSmallUpIcon width="20" height="20" />;
      case IconTypes.MoveDown:
        return <ArrowSmallDownIcon width="20" height="20" />;
      case IconTypes.GuideAddIcon:
        return <DocumentPlusIcon width="20" height="20" />;
      case IconTypes.ArrowDownTrayIcon:
        return <ArrowDownTrayIcon width="20" height="20" />;
      case IconTypes.Reload:
        return <ArrowPathIcon width="20" height="20" />;
      case IconTypes.RobotIconSolid:
        return <RobotIconSolid />;
      default:
        return null;
    }
  };

  return (
    <StyledUiButton
      disabled={disabled}
      primary={primary}
      variant={variant}
      loading={loading}
      removeBorder={removeBorder}
      size="sm"
      onClick={onClick}
      className={className}
    >
      {renderIcon()}
    </StyledUiButton>
  );
}

export default IconButton;
