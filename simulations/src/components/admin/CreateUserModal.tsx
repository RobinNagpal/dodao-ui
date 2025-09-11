import { UserRole } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Loader2 } from 'lucide-react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserCreationRequest {
  email: string;
  name?: string;
  role: UserRole;
}

interface UserCreationResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps): JSX.Element {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Student');
  const [formError, setFormError] = useState<string>('');

  // Role options for StyledSelect
  const roleOptions: StyledSelectItem[] = [
    { id: 'Admin', label: 'Admin' },
    { id: 'Instructor', label: 'Instructor' },
    { id: 'Student', label: 'Student' },
  ];

  const { postData, loading } = usePostData<UserCreationResponse, UserCreationRequest>({
    successMessage: 'User created successfully!',
    errorMessage: 'Failed to create user',
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Email is required');
      return;
    }

    try {
      await postData('/api/users', {
        email,
        name: name || undefined,
        role,
      });
      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setFormError('Failed to create user');
    }
  };

  const resetForm = (): void => {
    setName('');
    setEmail('');
    setRole('Student');
    setFormError('');
  };

  return (
    <SingleSectionModal
      open={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Create New User"
    >
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-4 text-left">Add a new user to the system. Email is required.</p>
        <form onSubmit={handleSubmit} className="text-left space-y-4">
          <Input label="Email" id="email" modelValue={email} onUpdate={(value) => setEmail(value as string)} placeholder="user@example.com" required={true} />

          <Input label="Name" id="name" modelValue={name} onUpdate={(value) => setName(value as string)} placeholder="John Doe" required={false} />

          <StyledSelect label="Role" selectedItemId={role} items={roleOptions} setSelectedItemId={(id) => setRole(id as UserRole)} />

          {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </div>
        </form>
      </div>
    </SingleSectionModal>
  );
}
