// styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #384aff;
    --bg-color: white;
    --text-color: #57606a;
    --link-color: #111111;
    --heading-color: #111111;
    --border-color: #d0d7de;
    --header-bg: rgb(245, 249, 255);
    --block-bg: transparent;
    --header-main-bg: rgba(255, 255, 255, 0.9);
    --box-shadow: 0 4px 16px 0 rgba(26, 27, 30, 0.1);
    --border-width: 0px;
  }
`;

export default GlobalStyle;
