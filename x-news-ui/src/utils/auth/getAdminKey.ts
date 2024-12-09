export function getAdminKey(): string {
    return localStorage.getItem("ADMIN_KEY") ?? '';
  }
  