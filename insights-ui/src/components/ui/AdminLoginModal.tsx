'use client';

import { useEffect, useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { isAdmin } from '@/util/auth/isAdmin';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${getBaseUrl()}/api/actions/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('AUTHENTICATION_KEY', adminCode);
        onClose();
      } else {
        setError(data.message || 'Incorrect admin code');
      }
    } catch (err) {
      setError('Error occurred while authenticating');
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
