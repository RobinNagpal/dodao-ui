'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { UserRole } from '@prisma/client';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import UserRow from './UserRow';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  username: string;
  role: UserRole;
}

interface UsersResponse {
  users: User[];
}

export default function Page() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string>('');

  const {
    data: usersResponse,
    loading: loadingUsers,
    reFetchData: refetchUsers,
  } = useFetchData<UsersResponse>(`${getBaseUrl()}/api/users`, {}, 'Failed to load users');

  const { deleteData: deleteUser, loading: deletingUser } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'User deleted successfully!',
    errorMessage: 'Failed to delete user',
  });

  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId: string): void => {
    setDeleteUserId(userId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    try {
      await deleteUser(`${getBaseUrl()}/api/users/${deleteUserId}`);
      await refetchUsers();
      setShowDeleteConfirm(false);
      setDeleteUserId('');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUserSuccess = async (): Promise<void> => {
    await refetchUsers();
  };

  const users = usersResponse?.users || [];

  return (
    <PageWrapper>
      <AdminNav />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">User Management</h2>
          <p className="text-emerald-600/70 mt-1">Manage users and their roles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Add User</span>
        </button>
      </div>

      {loadingUsers ? (
        <div className="flex justify-center items-center h-40">
          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span className="text-lg font-medium text-emerald-600">Loading users...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-16">
              <UsersIcon className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No users</h3>
              <p className="text-gray-600 mb-6">Get started by adding a new user.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add User</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {users.map((user) => (
                    <UserRow key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <CreateUserModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handleUserSuccess} />

      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleUserSuccess}
          user={selectedUser}
        />
      )}

      <ConfirmationModal
        open={showDeleteConfirm}
        showSemiTransparentBg={true}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirming={deletingUser}
        title="Delete User"
        confirmationText="Are you sure you want to delete this user? This action cannot be undone."
        askForTextInput={false}
      />
    </PageWrapper>
  );
}
