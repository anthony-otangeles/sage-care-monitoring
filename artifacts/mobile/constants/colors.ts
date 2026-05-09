/**
 * Semantic design tokens for the SAGE app.
 */

const colors = {
  light: {
    // Core surfaces
    background: "#F4EFE8", // warm cream
    foreground: "#1F1B16", // charcoal

    // Cards / elevated surfaces
    card: "#FFFFFF",
    cardForeground: "#1F1B16",

    // Primary action color (buttons, links, active states)
    primary: "#1F1B16",
    primaryForeground: "#FAF7F2",

    // Secondary / less-emphasis interactive surfaces
    secondary: "#EAE2D5",
    secondaryForeground: "#1F1B16",

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: "#EFE9DE",
    mutedForeground: "#6B6359",

    // Accent highlights (badges, selected items, focus rings)
    accent: "#D9532A", // warm coral/orange
    accentForeground: "#FFFFFF",

    // Destructive actions (delete, error states)
    destructive: "#C0392B",
    destructiveForeground: "#FFFFFF",

    // Borders and input outlines
    border: "#E2D9C9",
    input: "#E2D9C9",

    // Acuity semantic colors
    watchful: "#D9532A", // coral
    monitoring: "#C9892F", // amber
    stable: "#4A6B4A", // sage green
    decliningBg: "#F2DDD3",
    decliningText: "#B23E1A"
  },
  dark: {
    // Adding same as light to avoid dark mode invert for now, or could customize
    background: "#F4EFE8",
    foreground: "#1F1B16",
    card: "#FFFFFF",
    cardForeground: "#1F1B16",
    primary: "#1F1B16",
    primaryForeground: "#FAF7F2",
    secondary: "#EAE2D5",
    secondaryForeground: "#1F1B16",
    muted: "#EFE9DE",
    mutedForeground: "#6B6359",
    accent: "#D9532A",
    accentForeground: "#FFFFFF",
    destructive: "#C0392B",
    destructiveForeground: "#FFFFFF",
    border: "#E2D9C9",
    input: "#E2D9C9",
    watchful: "#D9532A",
    monitoring: "#C9892F",
    stable: "#4A6B4A",
    decliningBg: "#F2DDD3",
    decliningText: "#B23E1A"
  },
  radius: 16,
};

export default colors;
