// "use client";

// import { useEffect, useMemo } from "react";
// import { useAppSelector } from "@/lib/store/hooks";

// export default function ThemeInitializer() {
//   const { businessBlueprint } = useAppSelector(
//     (state) => state.businessBlueprint,
//   );

//   const cssVariables = useMemo(() => {
//     if (!businessBlueprint) return "";

//     // Handle both nested and flattened structures
//     const payload = businessBlueprint.payload || businessBlueprint;
//     const brandAssets = payload?.brandAssets;

//     if (!brandAssets) {
//       console.warn(
//         "ThemeInitializer: brandAssets not found in businessBlueprint",
//         businessBlueprint,
//       );
//       return "";
//     }

//     const themeConfig = brandAssets.public_theme || brandAssets;
//     const { colors, typography } = themeConfig || {};

//     if (!colors || !typography) {
//       console.warn("ThemeInitializer: colors or typography missing", {
//         colors,
//         typography,
//       });
//       return "";
//     }

//     // Generate @font-face for custom fonts
//     const fontFaces = typography?.customFonts
//       ?.map(
//         (font: any) => `
//       @font-face {
//         font-family: '${font.name}';
//         src: url('${font.url}');
//         font-weight: ${font.weight};
//         font-style: ${font.style};
//         font-display: swap;
//       }
//     `,
//       )
//       .join("\n");

//     return `
//       ${fontFaces}

//       :root {
//         /* UI Matrix Core Variables */
//         --primary: ${colors.core?.primary || "#000000"};
//         --secondary: ${colors.core?.secondary || "#000000"};
//         --accent: ${colors.core?.accent || "#000000"};
//         --background: ${colors.core?.background || "#ffffff"};
//         --surface: ${colors.core?.surface || "#ffffff"};
//         --text: ${colors.core?.text || "#000000"};

//         /* Button Tactical Variables */
//         --btn-primary-bg: ${colors.buttons?.primary || "#000000"};
//         --btn-primary-text: ${colors.buttons?.primaryText || "#ffffff"};
//         --btn-secondary-bg: ${colors.buttons?.secondary || "#ffffff"};
//         --btn-secondary-text: ${colors.buttons?.secondaryText || "#000000"};

//         /* Typography Engine Variables */
//         --font-main: ${typography?.bodyFont || "sans-serif"};
//         --font-heading: ${typography?.headingFont || "sans-serif"};

//         /* Overrides for Nestcraft Specific Variables if any */
//         --nest-primary: ${colors.core?.primary || "#000000"};
//       }

//       /* Global Application Overrides */
//       /* We only apply these if the blueprint explicitly defines them */
//       ${colors.core.background ? `body { background-color: var(--bg-color); }` : ""}
//       ${colors.core.text ? `body { color: var(--text-color); }` : ""}
//       ${typography.bodyFont ? `body { font-family: var(--font-main), sans-serif; }` : ""}
//       ${typography.headingFont ? `h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading), sans-serif; }` : ""}
//     `;
//   }, [businessBlueprint]);

//   useEffect(() => {
//     if (!cssVariables) return;

//     let styleTag = document.getElementById("dynamic-theme-overrides");
//     if (!styleTag) {
//       styleTag = document.createElement("style");
//       styleTag.id = "dynamic-theme-overrides";
//       document.head.appendChild(styleTag);
//     }
//     styleTag.innerHTML = cssVariables;
//   }, [cssVariables]);

//   return null;
// }

"use client";

import { useEffect, useMemo } from "react";
import { useAppSelector } from "@/lib/store/hooks";

export default function ThemeInitializer() {
  const { businessBlueprint } = useAppSelector(
    (state) => state.businessBlueprint,
  );

  const cssVariables = useMemo(() => {
    if (!businessBlueprint) return "";

    // Handle both nested and flattened structures
    const payload = businessBlueprint.payload || businessBlueprint;
    const brandAssets = payload?.brandAssets;

    if (!brandAssets) {
      console.warn(
        "ThemeInitializer: brandAssets not found in businessBlueprint",
        businessBlueprint,
      );
      return "";
    }

    const themeConfig = brandAssets.public_theme || brandAssets;
    const { colors, typography } = themeConfig || {};

    if (!colors || !typography) {
      console.warn("ThemeInitializer: colors or typography missing", {
        colors,
        typography,
      });
      return "";
    }

    // Support both the new flat shape (colors.primary, colors.buttons.primary, ...)
    // and the older nested shape (colors.core.primary) just in case older
    // blueprints are still floating around.
    const core = colors.core || colors;
    const buttons = colors.buttons || {};

    // Generate @font-face for custom fonts
    const fontFaces = typography?.customFonts
      ?.map(
        (font: any) => `
      @font-face {
        font-family: '${font.name}';
        src: url('${font.url}');
        font-weight: ${font.weight};
        font-style: ${font.style};
        font-display: swap;
      }
    `,
      )
      .join("\n");

    return `
      ${fontFaces}

      :root {
        /* UI Matrix Core Variables */
        --primary: ${core.primary || "#000000"};
        --secondary: ${core.secondary || "#000000"};
        --accent: ${core.accent || "#000000"};
        --background: ${core.background || "#ffffff"};
        --surface: ${core.surface || "#ffffff"};
        --text: ${core.text || "#000000"};

        /* Extended Palette Variables */
        --primary-light: ${colors.primaryLight || core.primary || "#ffffff"};
        --primary-dark: ${colors.primaryDark || core.primary || "#000000"};
        --primary-hover: ${colors.primaryHover || core.primary || "#000000"};
        --violet: ${colors.violet || "#000000"};
        --card: ${colors.card || core.surface || "#ffffff"};
        --text-secondary: ${colors.textSecondary || core.text || "#000000"};
        --text-muted: ${colors.textMuted || core.text || "#000000"};
        --border: ${colors.border || "#dddddd"};
        --border-hover: ${colors.borderHover || colors.border || "#cccccc"};
        --success: ${colors.success || "#2EAD5F"};
        --warning: ${colors.warning || "#E9A23B"};
        --danger: ${colors.danger || "#D9534F"};
        --info: ${colors.info || "#4FA3D9"};

        /* Button Tactical Variables */
        --btn-primary-bg: ${buttons.primary || "#000000"};
        --btn-primary-text: ${buttons.primaryText || "#ffffff"};
        --btn-secondary-bg: ${buttons.secondary || "#ffffff"};
        --btn-secondary-text: ${buttons.secondaryText || "#000000"};

        /* Typography Engine Variables */
        --font-main: ${typography?.bodyFont || "sans-serif"};
        --font-heading: ${typography?.headingFont || "sans-serif"};

        /* Overrides for Nestcraft Specific Variables if any */
        --nest-primary: ${core.primary || "#000000"};
      }

      /* Global Application Overrides */
      /* We only apply these if the blueprint explicitly defines them */
      ${core.background ? `body { background-color: var(--background); }` : ""}
      ${core.text ? `body { color: var(--text); }` : ""}
      ${typography.bodyFont ? `body { font-family: var(--font-main), sans-serif; }` : ""}
      ${typography.headingFont ? `h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading), sans-serif; }` : ""}
    `;
  }, [businessBlueprint]);

  useEffect(() => {
    if (!cssVariables) return;

    let styleTag = document.getElementById("dynamic-theme-overrides");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-theme-overrides";
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = cssVariables;
  }, [cssVariables]);

  return null;
}
