import { UserRole } from '@prisma/client';
import { Edit, Trash2, User } from 'lucide-react';

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
    role: UserRole;
    createdAt: string;
    hasPortfolioManagerProfile: boolean;
    favouriteItemsCount: number;
  };
  onEdit: (user: UserRowProps['user']) => void;
  onDelete: (userId: string) => void;
  onPortfolioProfile: (user: UserRowProps['user']) => void;
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
        <div className="text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-300">{user.favouriteItemsCount}</div>
      </td>
      <td className="px-6 py-4 text-sm font-medium">
        <div className="flex space-x-3">
          <button onClick={() => onPortfolioProfile(user)} className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center">
            <User className="h-4 w-4 mr-1" />
            Portfolio
          </button>
          <button onClick={() => onEdit(user)} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center">
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
