// styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

const ArbitrumTheme = createGlobalStyle`
  :root {
    --primary-color: #1B4ADD;
    --bg-color: #0A0A0A;
    --text-color: rgba(248, 250, 252, 1);
    --link-color: white;
    --heading-color: white;
    --border-color: #4971E9;
    --header-bg: #0A0A0A;
  }
`;

export default ArbitrumTheme;
