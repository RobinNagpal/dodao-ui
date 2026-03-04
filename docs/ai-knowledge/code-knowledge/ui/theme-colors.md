For colors we use special theme classes which uses CSS variables. Below I am passing the theme-styles.scss

In my layout also I pass these css variables as styles. 

So dont hardcode the colors in the components. Use the classes instead or the inherited styles from layout

# layout.tsx


```tsx

import { CSSProperties } from 'react';

export const themeColors = {
  '--primary-color': '#4F46E5', // Indigo-600 for primary actions
  '--primary-text-color': '#ffffff', // Crisp white text on primary elements
  '--bg-color': '#1F2937', // Gray-800 for the main background
  '--text-color': '#D1D5DB', // Gray-300 for body text for good contrast
  '--link-color': '#4F46E5', // Matching the primary color for links
  '--heading-color': '#ffffff', // White for headings
  '--border-color': '#374151', // Gray-700 for subtle borders
  '--block-bg': '#374151', // A slightly lighter dark for block backgrounds
  '--swiper-theme-color': '#4F46E5', // Consistent with the primary color for Swiper components
} as CSSProperties;


export default function RootLayout({
     children,
   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap" />
    </head>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-color`} style={{ ...themeColors, backgroundColor: 'var(--bg-color)' }}>
    <NotificationProvider>
      <>
        <NotificationWrapper />
        <TopNav />
        {children}
      </>
    </NotificationProvider>

    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=G-MYQG66ESX3`} />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-MYQG66ESX3');
        `}
      </Script>
    </>
    </body>
    </html>
  );
}

```

theme-styles.scss

```scss
.text-color {
color: var(--text-color);
}

.heading-color {
color: var(--heading-color);
}

.primary-text-color {
color: var(--primary-color);
}

.primary-color {
color: var(--primary-color);
}

.primary-text-color {
color: var(--primary-text-color);
}

.link-color {
color: var(--link-color);
}

.background-color {
background-color: var(--bg-color);
}

.block-bg-color {
background-color: var(--block-bg);
}

.block-bg-color:hover {
background-color: var(--block-bg);
}

.border-color {
border-color: var(--border-color);
}

.divider-bg {
background-color: var(--border-color);
}
.bg-primary-text {
background-color: var(--primary-text-color);
}

.bg-primary-color {
background-color: var(--primary-color);
}
.ring-border {
/* When used in conjunction with Tailwind’s ring-1, this sets the ring color */
--tw-ring-color: var(--border-color);
}

.border-primary-color {
border-color: var(--primary-color);
}
```
