import { ApolloClient, InMemoryCache } from '@apollo/client';

const MorphoClient = new ApolloClient({
  uri: 'https://api.morpho.org/graphql',
  cache: new InMemoryCache(),
});

export default MorphoClient;
