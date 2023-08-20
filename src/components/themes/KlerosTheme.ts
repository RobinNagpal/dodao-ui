// styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

const KlerosStyle = createGlobalStyle`
  :root {
    --primary-color: #4d00b4;
    --bg-color: #ffffff;
    --text-color: #000000;
    --link-color: #000000;
    --heading-color: #4d00b4;
    --border-color: #cccccc;
    --header-bg: #fbf9fe;
    --block-bg: transparent;
  }
`;

export default KlerosStyle;
