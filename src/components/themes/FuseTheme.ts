// styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

const FuseStyle = createGlobalStyle`
  :root {
    --primary-color: #000;
    --bg-color: #FFF;
    --text-color: #000;
    --link-color: #333;
    --heading-color: #000;
    --border-color: #555;
    --header-bg: #EEE;
    --block-bg: #EEE;
  }
`;

export default FuseStyle;
