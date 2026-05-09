/**
 * SAGE design tokens — based on the brand design system.
 * Inter typography. Lavender primary, Mint secondary.
 */

const palette = {
  // Neutrals
  fg1: "#1C192E",
  fg2: "#6A7282",
  fg3: "#99A1AF",
  borderStrong: "#D1D5DC",
  border: "#E5E7EB",
  divider: "#EEEEEE",
  canvas: "#F7F7F7",
  hover: "#F8F8F8",
  surfaceAlt: "#F9FAFB",
  surface: "#FFFFFF",

  // Brand
  primary: "#845EC2",
  primaryDark: "#7755AF",
  primaryLight: "#F5F2FD",
  primaryText: "#67568C",

  secondary: "#00C9A7",
  secondaryDark: "#00B798",
  secondaryLight: "#E9F5F3",

  // Status
  info: "#0081CF",
  success: "#29BB89",
  concern: "#E9C05F",
  warning: "#FF9671",
  error: "#C34A7D",

  // Tints
  lavenderTint: "#F5F2FD",
  coralTint: "#FFF3EF",
  pinkTint: "#FFF3F8",
  mintTint: "#E7F5EF",
  goldTint: "#FFF8E6",
  coralText: "#FF6E6C",
  pinkText: "#C34A7D",
  goldText: "#B58420",
};

const semantic = {
  background: palette.canvas,
  foreground: palette.fg1,
  card: palette.surface,
  cardForeground: palette.fg1,
  primary: palette.secondary, // mint primary CTA per spec
  primaryForeground: "#FFFFFF",
  primaryDark: palette.secondaryDark,
  brand: palette.primary, // lavender accent
  brandLight: palette.primaryLight,
  brandText: palette.primaryText,
  secondary: palette.surface,
  secondaryForeground: palette.fg2,
  muted: palette.surfaceAlt,
  mutedForeground: palette.fg2,
  placeholder: palette.fg3,
  accent: palette.primary,
  accentForeground: "#FFFFFF",
  destructive: palette.error,
  destructiveForeground: "#FFFFFF",
  border: palette.border,
  borderStrong: palette.borderStrong,
  divider: palette.divider,
  input: palette.border,

  // Acuity
  watchful: palette.warning,
  watchfulBg: palette.coralTint,
  monitoring: palette.goldText,
  monitoringBg: palette.goldTint,
  stable: palette.success,
  stableBg: palette.mintTint,

  // Status
  info: palette.info,
  success: palette.success,
  concern: palette.concern,
  warning: palette.warning,
  error: palette.error,

  // Tints
  lavenderTint: palette.lavenderTint,
  coralTint: palette.coralTint,
  pinkTint: palette.pinkTint,
  mintTint: palette.mintTint,
  goldTint: palette.goldTint,
  coralText: palette.coralText,
  pinkText: palette.pinkText,
  goldText: palette.goldText,
  primaryText: palette.primaryText,
};

const colors = {
  light: semantic,
  dark: semantic,
  radius: 8,
  palette,
};

export default colors;
