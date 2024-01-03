import { Session } from '@/types/auth/Session';

const superAdminsFromEnv = process.env.DODAO_SUPERADMINS ? process.env.DODAO_SUPERADMINS.split(',') : [];
const superAdmins = [...superAdminsFromEnv, '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9', 'robinnagpal.tiet@gmail.com'].map((u) => u.toLowerCase().trim());

export const isSuperAdmin = (session: Session) => {
  console.log(session.username && superAdmins.includes(session.username.toLowerCase()));
  return session.username && superAdmins.includes(session.username.toLowerCase());
};
