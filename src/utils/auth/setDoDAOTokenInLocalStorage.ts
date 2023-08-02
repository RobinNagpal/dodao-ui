import { Session } from '@/types/auth/Session';
import { DODAO_ACCESS_TOKEN_KEY } from '@/types/deprecated/models/enums';

export function setDoDAOTokenInLocalStorage(session?: Session) {
  try {
    if (session?.dodaoAccessToken) {
      localStorage.setItem(DODAO_ACCESS_TOKEN_KEY, session?.dodaoAccessToken);
    }
  } catch (error) {
    console.log(error);
  }
}
