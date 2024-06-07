import { Session } from '@dodao/web-core/types/auth/Session';

const superAdminsFromEnv = process.env.DODAO_SUPERADMINS ? process.env.DODAO_SUPERADMINS.split(',') : [];
const superAdmins = [
  ...superAdminsFromEnv,
  '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9',
  'robinnagpal.tiet@gmail.com',
  '0xda878e846d2df54e10224e45587c302dedd02292', // Neusha
].map((u) => u.toLowerCase().trim());

export const isSuperAdmin = (session: Session) => {
  return session.username && superAdmins.includes(session.username.toLowerCase());
};
