import { UserRole } from '@prisma/client';
import { Edit, Trash2, User } from 'lucide-react';

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
    role: UserRole;
    authProvider: string;
    createdAt: string;
    hasPortfolioManagerProfile: boolean;
    favouriteItemsCount: number;
  };
  onEdit: (user: UserRowProps['user']) => void;
  onDelete: (userId: string) => void;
  onPortfolioProfile: (user: UserRowProps['user']) => void;
}

const authProviderLabels: Record<string, string> = {
  'custom-email': 'Custom Email',
  email: 'Custom Email',
  google: 'Google',
  discord: 'Discord',
  twitter: 'Twitter',
  crypto: 'Crypto',
};

function getAuthProviderBadgeClasses(authProvider: string): string {
  switch (authProvider) {
    case 'google':
      return 'bg-red-900 text-red-200';
    case 'custom-email':
    case 'email':
      return 'bg-amber-900 text-amber-200';
    case 'discord':
      return 'bg-indigo-900 text-indigo-200';
    case 'twitter':
      return 'bg-sky-900 text-sky-200';
    case 'crypto':
      return 'bg-emerald-900 text-emerald-200';
    default:
      return 'bg-surface-2 text-body';
  }
}

export default function UserRow({ user, onEdit, onDelete, onPortfolioProfile }: UserRowProps): JSX.Element {
  return (
    <tr key={user.id}>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold">{user.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium">{user.name || 'N/A'}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              user.role === 'Admin' ? 'bg-purple-900 text-purple-200' : user.role === 'FreeUser' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'
            }`}
          >
            {user.role}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getAuthProviderBadgeClasses(user.authProvider)}`}>
          {authProviderLabels[user.authProvider] || user.authProvider || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-muted">{new Date(user.createdAt).toLocaleDateString()}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-muted">{user.favouriteItemsCount}</div>
      </td>
      <td className="px-6 py-4 text-sm font-medium">
        <div className="flex space-x-3">
          <button onClick={() => onPortfolioProfile(user)} className="text-link hover:text-link font-medium transition-colors flex items-center">
            <User className="h-4 w-4 mr-1" />
            Portfolio
          </button>
          <button onClick={() => onEdit(user)} className="text-link hover:text-link font-medium transition-colors flex items-center">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button onClick={() => onDelete(user.id)} className="text-red-400 hover:text-red-300 font-medium transition-colors flex items-center">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
