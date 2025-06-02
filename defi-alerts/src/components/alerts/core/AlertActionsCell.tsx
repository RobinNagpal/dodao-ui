'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';
import { Alert } from '@/types/alerts';
import { useRouter } from 'next/navigation';

interface AlertActionsCellProps {
  alert: Alert;
  setAlertToDelete: (id: string) => void;
  setShowConfirmModal: (show: boolean) => void;
}

/**
 * Component for displaying alert actions in a dropdown menu
 */
const AlertActionsCell: React.FC<AlertActionsCellProps> = ({ alert, setAlertToDelete, setShowConfirmModal }) => {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-0 hover-text-primary">
          <span className="sr-only">Open menu</span>
          <EllipsisVertical className="ml-4 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-block">
        <div className="hover-border-primary hover-text-primary">
          <DropdownMenuItem className="text-theme-primary cursor-pointer" onClick={() => router.push(`/alerts/edit/${alert.id}`)}>
            Edit
          </DropdownMenuItem>
        </div>
        <div className="hover-border-primary hover-text-primary">
          <DropdownMenuItem className="text-theme-primary cursor-pointer" onClick={() => router.push(`/alerts/history/${alert.id}`)}>
            History
          </DropdownMenuItem>
        </div>
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={() => {
            setAlertToDelete(alert.id);
            setShowConfirmModal(true);
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AlertActionsCell;
