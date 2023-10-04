// styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

const OptimismTheme = createGlobalStyle`
  :root {
    --primary-color: #ff0420;
    --bg-color: #1E1313;
    --text-color: #f1f1f3;
    --link-color: #f1f1f3;
    --heading-color: #f1f1f3;
    --border-color: #d1d5da;
    --header-bg: #1E1313;
    --block-bg: #241313;
  }
`;

export default OptimismTheme;
