import { Session } from '@dodao/web-core/types/auth/Session';
import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';

export function setDoDAOTokenInLocalStorage(session?: Session) {
  try {
    if (session?.dodaoAccessToken) {
      localStorage.setItem(DODAO_ACCESS_TOKEN_KEY, 'Bearer ' + session.dodaoAccessToken);
    }
  } catch (error) {
    console.log(error);
  }
}
