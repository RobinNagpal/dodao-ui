// styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

const BalancerTheme = createGlobalStyle`
  :root {
    --primary-color: #3183ff;
    --bg-color: rgb(15, 23, 42);
    --text-color: rgba(248, 250, 252, 1);
    --link-color: white;
    --heading-color: white;
    --border-color: #0751bf;
    --header-bg: rgb(15, 23, 42);
  }
`;

export default BalancerTheme;
