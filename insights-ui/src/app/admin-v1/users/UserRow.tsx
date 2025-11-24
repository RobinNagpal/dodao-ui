import { UserRole } from '@prisma/client';
import { Edit, Trash2, User } from 'lucide-react';

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
    role: UserRole;
  };
  onEdit: (user: UserRowProps['user']) => void;
  onDelete: (userId: string) => void;
  onPortfolioProfile: (user: UserRowProps['user']) => void;
}

export default function UserRow({ user, onEdit, onDelete, onPortfolioProfile }: UserRowProps): JSX.Element {
  return (
    <tr key={user.id} className="hover:bg-emerald-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-gray-900">{user.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 font-medium">{user.name || 'N/A'}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : user.role === 'FreeUser' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {user.role}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-medium">
        <div className="flex space-x-3">
          <button
            onClick={() => onPortfolioProfile(user)}
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors flex items-center"
          >
            <User className="h-4 w-4 mr-1" />
            Portfolio
          </button>
          <button
            onClick={() => onEdit(user)}
            className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline transition-colors flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-800 font-medium hover:underline transition-colors flex items-center">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
