'use client';

import { useEffect, useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { isAdmin } from '@/util/auth/isAdmin';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setAdminCode('');
      setError('');
    }
  }, [open]);

  const validAdminCodes = (process.env.NEXT_PUBLIC_ADMIN_CODES || '').split(',').map((code) => code.trim());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (validAdminCodes.includes(adminCode)) {
      localStorage.setItem('AUTHENTICATION_KEY', adminCode);
      onClose();
      setAdminCode('');
    } else {
      setError('Incorrect admin code');
    }
  };

  return (
    <SingleSectionModal open={open} onClose={onClose} title={isAdmin() ? 'You are already logged in as admin.' : 'Admin Login'}>
      <div className="p-4">
        {!isAdmin() && (
          <form onSubmit={handleSubmit}>
            <Input id="adminCode" modelValue={adminCode} onUpdate={(e) => (e ? setAdminCode(e.toString()) : setAdminCode(''))} required />
            {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
            <div className="w-full flex justify-center">
              <Button type="submit" primary variant={'contained'} className="mt-4">
                Authenticate
              </Button>
            </div>
          </form>
        )}
      </div>
    </SingleSectionModal>
  );
}
