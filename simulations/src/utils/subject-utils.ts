import { BusinessSubject } from '../types';

export const getSubjectDisplayName = (subject: BusinessSubject): string => {
  const displayNames: Record<BusinessSubject, string> = {
    HR: 'Human Resources',
    ECONOMICS: 'Economics',
    MARKETING: 'Marketing',
    FINANCE: 'Finance',
    OPERATIONS: 'Operations',
  };
  return displayNames[subject];
};

export const getSubjectIcon = (subject: BusinessSubject): string => {
  const icons: Record<BusinessSubject, string> = {
    HR: '👥',
    ECONOMICS: '📊',
    MARKETING: '📈',
    FINANCE: '💰',
    OPERATIONS: '⚙️',
  };
  return icons[subject];
};

export const getSubjectColor = (subject: BusinessSubject): string => {
  const colors: Record<BusinessSubject, string> = {
    HR: 'from-green-500 to-emerald-600',
    ECONOMICS: 'from-blue-500 to-cyan-600',
    MARKETING: 'from-pink-500 to-rose-600',
    FINANCE: 'from-yellow-500 to-orange-600',
    OPERATIONS: 'from-purple-500 to-indigo-600',
  };
  return colors[subject];
};
