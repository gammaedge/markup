import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #fafafa;
    --bg-tertiary: #f0f0f2;
    --bg-hover: #e8e8ea;
    --text-primary: #1d1d1f;
    --text-secondary: #6e6e73;
    --text-tertiary: #86868b;
    --border-color: #e0e0e2;
    --border-light: #f0f0f2;
    --accent-color: #007aff;
    --accent-hover: #0051d5;
    --accent-light: #e5f1ff;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.08);
    --shadow-glow: 0 0 0 3px rgba(0, 122, 255, 0.15);
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
  }

  [data-theme='dark'] {
    --bg-primary: #1c1c1e;
    --bg-secondary: #252528;
    --bg-tertiary: #2c2c2e;
    --bg-hover: #3a3a3c;
    --text-primary: #ffffff;
    --text-secondary: #a1a1a6;
    --text-tertiary: #6e6e73;
    --border-color: #38383a;
    --border-light: #2c2c2e;
    --accent-color: #0a84ff;
    --accent-hover: #409cff;
    --accent-light: #0a84ff20;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.4);
    --shadow-glow: 0 0 0 3px rgba(10, 132, 255, 0.25);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  #root {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  ::selection {
    background-color: var(--accent-color);
    color: white;
  }
`;