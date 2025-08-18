// Mock admin credentials for login validation
export const mockAdminCredentials = ['admin@example.com', 'admin2@example.com'];

// Helper function to check if email belongs to an admin
export const isAdminEmail = (email: string): boolean => {
  return mockAdminCredentials.includes(email.toLowerCase());
};
