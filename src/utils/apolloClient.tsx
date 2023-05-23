import { Session } from '@/types/Session';
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const getAuthenticatedApolloClient = (session: Session | null) => {
  let headers: Record<string, string> = {};

  if (session?.dodaoAccessToken) {
    headers['dodao-auth-token'] = session.dodaoAccessToken;
  }

  return new ApolloClient({
    uri: process.env.V2_API_SERVER_URL!,
    cache: new InMemoryCache(),
    headers: headers,
  });
};
