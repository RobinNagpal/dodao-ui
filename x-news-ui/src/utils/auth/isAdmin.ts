export function isAdmin(): boolean {
  const adminKey = localStorage ? localStorage.getItem("adminKey") : null;
  return !!adminKey;
}
