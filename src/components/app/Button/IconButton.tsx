// Import necessary libraries and components
import Button from '@/components/app/Button';
import DeleteIcon from '@/components/app/Icons/DeleteIcon';
import EditIcon from '@/components/app/Icons/EditIcon';
import GuideAddIcon from '@/components/app/Icons/GuideAddIcon';
import { IconTypes } from '@/components/app/Icons/IconTypes';
import MoveDown from '@/components/app/Icons/MoveDown';
import MoveUp from '@/components/app/Icons/MoveUp';
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
        return <DeleteIcon />;
      case IconTypes.Edit:
        return <EditIcon />;
      case IconTypes.MoveUp:
        return <MoveUp />;
      case IconTypes.MoveDown:
        return <MoveDown />;
      case IconTypes.GuideAddIcon:
        return <GuideAddIcon />;
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
