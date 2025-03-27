'use client';

import { useEffect, useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { isAdmin } from '@/util/auth/isAdmin';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
}

interface AuthResponse {
  success: boolean;
}

export default function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const [adminCode, setAdminCode] = useState('');

  const { postData, loading, data, error } = usePostData<AuthResponse, { adminCode: string }>(
    {
      successMessage: 'Successfully authenticated as admin!',
      errorMessage: 'Invalid admin code',
    },
    {}
  );

  useEffect(() => {
    if (!open) {
      setAdminCode('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await postData(`${getBaseUrl()}/api/actions/authenticate`, { adminCode });

    if (response?.success) {
      localStorage.setItem('AUTHENTICATION_KEY', adminCode);
      onClose();
    }
  };

  return (
    <SingleSectionModal open={open} onClose={onClose} title={isAdmin() ? 'You are already logged in as admin.' : 'Admin Login'}>
      <div className="p-4">
        {!isAdmin() && (
          <form onSubmit={handleSubmit}>
            {error && <div className="text-red-500 ml-1 mb-2">{error}</div>}
            <Input id="adminCode" modelValue={adminCode} onUpdate={(val) => setAdminCode(val?.toString() ?? '')} required />
            <div className="w-full flex justify-center">
              <Button type="submit" primary variant="contained" className="mt-4" disabled={loading}>
                {loading ? 'Authenticating...' : 'Authenticate'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </SingleSectionModal>
  );
}
