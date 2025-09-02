// Mock admin credentials for login validation
export const mockAdminCredentials = ['admin@example.com', 'admin2@example.com'];

export const mockInstructorCredentials = ['rrobertson@ivey.ca', 'john.anderson@business.univusa.edu'];

export const mockStudentCredentials = ['michael.chen23@nus.edu.sg', 'gchapel@ivey.ca', 'lucas.martin25@insead.edu', 'emily.roberts22@ku.d'];
// Helper function to check if email belongs to an admin
export const isAdminEmail = (email: string): boolean => {
  return mockAdminCredentials.includes(email.toLowerCase());
};

export const isInstructorEmail = (email: string): boolean => {
  return mockInstructorCredentials.includes(email.toLowerCase());
};

export const isStudentEmail = (email: string): boolean => {
  return mockStudentCredentials.includes(email.toLowerCase());
};

export const isCurrentUserAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userType = localStorage.getItem('user_type');
  return userType === 'admin';
};

export const isCurrentUserInstructor = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userType = localStorage.getItem('user_type');
  return userType === 'instructor';
};

export const isCurrentUserStudent = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userType = localStorage.getItem('user_type');
  return userType === 'student';
};
