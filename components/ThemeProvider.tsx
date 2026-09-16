'use client';
import themeConfig from '../theme.json'; // Adjust path accordingly

export default function ThemeProvider({ 
  children, 
  isAdmin = false,
  businessBlueprint
}: { 
  children: React.ReactNode, 
  isAdmin?: boolean,
  businessBlueprint?: any
}) {
  // Select which theme to use based on the section
  const defaultTheme = isAdmin ? themeConfig.admin_theme : themeConfig.public_theme;
  
  const publicApiTheme = businessBlueprint?.experience?.public?.theme || businessBlueprint?.payload?.experience?.public?.theme || businessBlueprint?.payload?.brandKit?.public_theme || businessBlueprint?.payload?.brandAssets?.public_theme || businessBlueprint?.payload?.public_theme;
  const adminApiTheme = businessBlueprint?.experience?.admin?.theme || businessBlueprint?.payload?.experience?.admin?.theme || businessBlueprint?.payload?.brandKit?.admin_theme || businessBlueprint?.payload?.brandAssets?.admin_theme || businessBlueprint?.payload?.admin_theme;
  const apiTheme = isAdmin ? adminApiTheme : publicApiTheme;
  
  const theme = {
    colors: { ...defaultTheme.colors, ...(apiTheme?.colors || {}) },
    typography: { ...defaultTheme.typography, ...(apiTheme?.typography || {}) },
    darkMode: { ...(defaultTheme as any).darkMode, ...(apiTheme?.darkMode || {}) },
  };
  return (
    <>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{
        __html: `
          :root {
            --primary: ${theme.colors.primary};
            --primary-light: ${theme.colors.primaryLight};
            --primary-dark: ${theme.colors.primaryDark};
            --secondary: ${theme.colors.secondary};
            --accent: ${theme.colors.accent};
            --background: ${theme.colors.background};
            --surface: ${theme.colors.surface};
            --card: ${theme.colors.card};
            --foreground: ${theme.colors.text};
            --muted: ${theme.colors.textMuted};
            --border: ${theme.colors.border};
            
            --font-sans: "${theme.typography.bodyFont}", sans-serif;
            --font-heading: "${theme.typography.headingFont}", sans-serif;
          }
          
          /* Dark mode specific overrides from JSON */
          [data-theme="dark"], .dark {
            --background: ${theme.darkMode.background};
            --surface: ${theme.darkMode.surface};
            --card: ${theme.darkMode.card};
            --foreground: ${theme.darkMode.text};
            --border: ${theme.darkMode.border};
          }
        `
      }} />
      {children}
    </>
  );
}
