export function isAdmin(): boolean {
  return !!localStorage.getItem("ADMIN_KEY");
}
