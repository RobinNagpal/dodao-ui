import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.V2_API_SERVER_URL!,
  cache: new InMemoryCache(),
});

export default client;
