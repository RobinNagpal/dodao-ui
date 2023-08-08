import { Session } from '@/types/auth/Session';

export const superAdmins = ['0x470579d16401a36bf63b1428eaa7189fbde5fee9', 'robinnagpal.near', 'robinnagpal.tiet@gmail.com'].map((username) =>
  username.toLowerCase()
);

export const isSuperAdmin = (session: Session) => {
  return session.username && superAdmins.includes(session.username.toLowerCase());
};
