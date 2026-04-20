'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import Checkbox from '@dodao/web-core/components/app/Form/Checkbox';
import { UserRole } from '@prisma/client';
import { ChevronLeft, ChevronRight, Plus, Users as UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import UserRow from './UserRow';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import AddEditPortfolioProfileModal from '@/components/portfolios/AddEditPortfolioProfileModal';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  username: string;
  role: UserRole;
  createdAt: string;
  hasPortfolioManagerProfile: boolean;
  favouriteItemsCount: number;
}

interface UsersResponse {
  users: User[];
  totalCount: number;
}

interface DeleteProfileResponse {
  success: boolean;
}

const roleFilterItems: StyledSelectItem[] = [
  { id: 'All', label: 'All Roles' },
  { id: 'Admin', label: 'Admin' },
  { id: 'FreeUser', label: 'FreeUser' },
];

export default function Page() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPortfolioProfileModal, setShowPortfolioProfileModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [portfolioProfileUser, setPortfolioProfileUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isManagerFilter, setIsManagerFilter] = useState<boolean>(false);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 100;

  const usersApiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    if (roleFilter !== 'All') params.set('role', roleFilter);
    if (isManagerFilter) params.set('isManager', 'true');
    if (isActiveFilter) params.set('isActive', 'true');
    return `${getBaseUrl()}/api/users?${params.toString()}`;
  }, [currentPage, roleFilter, isManagerFilter, isActiveFilter]);

  const { data: usersResponse, loading: loadingUsers, reFetchData: refetchUsers } = useFetchData<UsersResponse>(usersApiUrl, {}, 'Failed to load users');

  const totalCount = usersResponse?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const { deleteData: deleteUser, loading: deletingUser } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'User deleted successfully!',
    errorMessage: 'Failed to delete user',
  });

  const { deleteData: deletePortfolioProfile } = useDeleteData<DeleteProfileResponse, never>({
    successMessage: 'Portfolio manager profile deleted successfully!',
    errorMessage: 'Failed to delete portfolio manager profile',
  });

  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handlePortfolioProfile = (user: User): void => {
    setPortfolioProfileUser(user);
    setShowPortfolioProfileModal(true);
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

  const handleDeleteProfile = async (profileId: string): Promise<void> => {
    try {
      await deletePortfolioProfile(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profiles/${profileId}`);
      await handleUserSuccess();
      setShowPortfolioProfileModal(false);
      setPortfolioProfileUser(null);
    } catch (error) {
      console.error('Error deleting portfolio manager profile:', error);
    }
  };

  const users = usersResponse?.users || [];

  const handleRoleFilterChange = (id: string | null) => {
    setRoleFilter(id || 'All');
    setCurrentPage(1);
  };

  const handleIsManagerFilterChange = (checked: boolean) => {
    setIsManagerFilter(checked);
    setCurrentPage(1);
  };

  const handleIsActiveFilterChange = (checked: boolean) => {
    setIsActiveFilter(checked);
    setCurrentPage(1);
  };

  return (
    <PageWrapper>
      <AdminNav />

      <div className="bg-gray-800 -mx-6 px-6 py-6 mb-6 border-b border-gray-700/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">User Management</h1>
            <p className="text-gray-300 mt-1">Manage users and their roles</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add User
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-6">
        <div className="w-48">
          <StyledSelect label="Role" items={roleFilterItems} selectedItemId={roleFilter} setSelectedItemId={handleRoleFilterChange} />
        </div>
        <Checkbox id="isManagerFilter" labelContent="Is Manager" isChecked={isManagerFilter} onChange={handleIsManagerFilterChange} />
        <Checkbox id="isActiveFilter" labelContent="Is Active" isChecked={isActiveFilter} onChange={handleIsActiveFilterChange} />
      </div>

      {loadingUsers ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400" />
          <span className="ml-3 text-indigo-300">Loading users...</span>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-16">
              <UsersIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">No users</h3>
              <p className="text-gray-400 mb-6">Get started by adding a new user.</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-5 w-5 mr-1" />
                Add User
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Favourites</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map((user) => (
                      <UserRow key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} onPortfolioProfile={handlePortfolioProfile} />
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/50 bg-gray-800/60">
                  <span className="text-sm text-gray-400">
                    Showing {(currentPage - 1) * pageSize + 1}
                    {'\u2013'}
                    {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
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

      {portfolioProfileUser && (
        <AddEditPortfolioProfileModal
          isOpen={showPortfolioProfileModal}
          onClose={() => {
            setShowPortfolioProfileModal(false);
            setPortfolioProfileUser(null);
          }}
          onSuccess={handleUserSuccess}
          onDelete={(profileId: string) => handleDeleteProfile(profileId)}
          isAdmin={true}
          userId={portfolioProfileUser.id}
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
