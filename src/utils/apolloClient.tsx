import { Session } from '@/types/auth/Session';
import { DODAO_ACCESS_TOKEN_KEY } from '@/types/deprecated/models/enums';
import { ApolloClient, ApolloLink, from, HttpLink, InMemoryCache } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';

const authTokenLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers }: any) => {
    let authToken = headers?.['dodao-auth-token'];

    if (typeof window !== 'undefined') {
      // Perform localStorage action
      authToken = authToken || localStorage.getItem(DODAO_ACCESS_TOKEN_KEY) || '';
    }

    return {
      headers: {
        ...(headers || {}),
        'dodao-auth-token': authToken, // however you get your token
      },
    };
  });

  return forward(operation);
});
export const getAuthenticatedApolloClient = (session: Session | null) => {
  let headers: Record<string, string> = {};

  let authToken = session?.dodaoAccessToken;

  if (typeof window !== 'undefined') {
    // Perform localStorage action
    authToken = authToken || localStorage.getItem(DODAO_ACCESS_TOKEN_KEY) || '';
  }

  if (authToken) {
    headers['dodao-auth-token'] = authToken;
  }

  const additiveLink = from([new RetryLink(), authTokenLink, new HttpLink({ uri: process.env.V2_API_SERVER_URL })]);

  return new ApolloClient({
    uri: process.env.V2_API_SERVER_URL!,
    cache: new InMemoryCache(),
    headers: headers,
    link: additiveLink,
  });
};
