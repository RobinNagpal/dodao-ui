# CSS and SCSS
- We try to use SCSS as much as possible.
- Benefits of SCSS:
  - Variables
  - Nesting
  - Mixins
  - Functions
  - Inheritance
  - Import
  - Operators
  - Control Directives
  - Comments
- Read more about SCSS [here](https://sass-lang.com/guide)

# CSS Modules
- Note: We don't use StyledComponents any longer as they are not supported in Server Side Rendering.
- We should never add code that looks like this:
  ```ts
    const StyledDiv = styled.div`
    background-color: var(--bg-color);
    color: var(--text-color);
    `;
  
  ```

- Instead, we should use CSS Modules. CSS Modules are a way to write CSS that's scoped to a single component, and not 
leak to any other element on the page.
- Next.js has built-in support for CSS Modules. You can create a CSS Module by creating a CSS/SCSS file with the extension 
`.module.css`.

# How Theme Works
- Read [docs/UnderstandingSpace.md](UnderstandingSpace.md) to understand how the space works.
- Space has a theme object that contains all the colors that we can customize.
    ```typescript
    export interface ThemeColors {
      primaryColor: string;
      bgColor: string;
      textColor: string;
      linkColor: string;
      headingColor: string;
      borderColor: string;
      blockBg: string;
    }
    
    
    export type WebCoreSpace = {
      id: string;
      // ....
      themeColors?: ThemeColors | null;
    };
    ```
- When we load the space, we load the theme object from the space.
- In `academy-ui/src/app/layout.tsx`, we initialize CSS variables with the theme colors.
    ```jsx
    const style = {
      '--primary-color': themeValue.primaryColor,
      '--bg-color': themeValue.bgColor,
      '--text-color': themeValue.textColor,
      '--link-color': themeValue.linkColor,
      '--heading-color': themeValue.headingColor,
      '--border-color': themeValue.borderColor,
      '--block-bg': themeValue.blockBg,
    } as CSSProperties;
  
    return (
      <html lang="en" className="h-full">
        <body className={'max-h-screen ' + theme} style={{ ...style, backgroundColor: 'var(--bg-color)' }}>
        </body>
      </html>
    );
    ```
  
- Now in the css/scss files, we can use these variables like this:
    ```scss
    .my-class {
      background-color: var(--bg-color);
      color: var(--text-color);
    }
    ```
- WE SHOULD NEVER ADD ANY COLOR DIRECTLY IN THE CSS/SCSS FILES. ALWAYS USE THE CSS VARIABLES. Only exception is 
#CCC(Gray) color which looks fine in most of the cases. This is also just for exceptional cases. Otherwise, always use
CSS variables.


# Checklist
- [ ] I understand what is SCSS and how it works.
- [ ] I understand what is CSS Modules and how it works and we should not use StyledComponents.
- [ ] I understand how the theme works and how to use the theme colors in the CSS/SCSS files.
- [ ] I understand that we should never add any color directly in the CSS/SCSS files. Always use the CSS variables.
