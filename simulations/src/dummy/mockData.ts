// Mock admin credentials for login validation
export const mockAdminCredentials = ['admin@example.com', 'admin2@example.com'];

export const mockInstructorCredentials = ['rrobertson@ivey.ca', 'john.anderson@business.univusa.edu'];

export const mockStudentCredentials = ['michael.chen23@nus.edu.sg', 'gchapel@ivey.ca'];
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
