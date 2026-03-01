- For buttons I use existing button component.
```tsx
export type ButtonProps = {
  primary?: boolean;
  variant?: 'outlined' | 'contained' | 'text';
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  size?: 'sm';
  removeBorder?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (e?: FormEvent<HTMLFormElement>) => void;
  className?: string;
};


import Button from '@dodao/web-core/components/core/buttons/Button';


<div className="flex justify-end mb-4">
  <Button
    loading={financialStatementsLoading}
    primary
    variant="contained"
    onClick={() => setShowConfirmModal(true)}
    disabled={financialStatementsLoading}
  >
    Refetch Financial Statements
  </Button>
</div>
```

- For small buttons we have IconButton component.
```tsx
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';

export enum IconTypes {
  Edit = 'Edit',
  Trash = 'Trash',
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  GuideAddIcon = 'GuideAddIcon',
  RobotIconSolid = 'RobotIconSolid',
  ArrowDownTrayIcon = 'ArrowDownTrayIcon',
  Reload = 'Reload',
  PlusIcon = 'PlusIcon',
  Refresh = 'ArrowPathIcon',
  Reading = 'Reading',
  Summary = 'Summary',
  FullScreenIcon = 'FullScreenIcon',
  ArrowsPointingOutIcon = 'ArrowsPointingOutIcon',
}


export type IconButtonProps = {
  disabled?: boolean;
  iconName: IconTypes;
  primary?: boolean;
  variant?: 'outlined' | 'contained' | 'text';
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  height?: string;
  width?: string;
  removeBorder?: boolean;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
};

<IconButton iconName={IconTypes.Edit} onClick={() => setShowTransformationPatchModal(true)} />

```
