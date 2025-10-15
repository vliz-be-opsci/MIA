/**
 * Theme configuration for MIA cards
 * Supports: default, glass, glass-dark, vliz, vliz-dark
 */

export type ThemeType = 'default' | 'glass' | 'glass-dark' | 'vliz' | 'vliz-dark';

export interface ThemeStyles {
  card: string;
  title: string;
  text: string;
  textSecondary: string;
  link: string;
  linkHover: string;
  icon: string;
}

/**
 * Theme style configurations
 */
export const THEME_CONFIGS: Record<ThemeType, ThemeStyles> = {
  // Default theme - current white card with shadow
  default: {
    card: 'bg-white rounded-lg shadow-lg',
    title: 'text-gray-800',
    text: 'text-gray-600',
    textSecondary: 'text-gray-500',
    link: 'text-gray-500',
    linkHover: 'hover:text-gray-700',
    icon: 'icon_svg'
  },
  
  // Glass theme - glassmorphism effect with light background
  glass: {
    card: 'rounded-lg shadow-xl backdrop-blur-md bg-white/30 border border-white/20',
    title: 'text-gray-900',
    text: 'text-gray-800',
    textSecondary: 'text-gray-700',
    link: 'text-gray-700',
    linkHover: 'hover:text-gray-900',
    icon: 'icon_svg'
  },
  
  // Glass dark theme - glassmorphism effect with dark background
  'glass-dark': {
    card: 'rounded-lg shadow-xl backdrop-blur-md bg-gray-900/40 border border-gray-700/30',
    title: 'text-white',
    text: 'text-gray-200',
    textSecondary: 'text-gray-300',
    link: 'text-gray-300',
    linkHover: 'hover:text-white',
    icon: 'icon_svg brightness-0 invert'
  },
  
  // VLIZ theme - VLIZ color scheme (blues and teals)
  // VLIZ-blauw: #354d9b, Zeeblauw: #31b7bc
  vliz: {
    card: 'rounded-lg shadow-lg',
    title: 'text-[#354d9b]',
    text: 'text-gray-700',
    textSecondary: 'text-gray-600',
    link: 'text-[#31b7bc]',
    linkHover: 'hover:text-[#354d9b]',
    icon: 'icon_svg'
  },
  
  // VLIZ dark theme - VLIZ colors for dark mode
  'vliz-dark': {
    card: 'rounded-lg shadow-xl bg-[#1a2947] border border-[#354d9b]/30',
    title: 'text-[#31b7bc]',
    text: 'text-gray-300',
    textSecondary: 'text-gray-400',
    link: 'text-[#31b7bc]',
    linkHover: 'hover:text-white',
    icon: 'icon_svg brightness-0 invert'
  }
};

/**
 * Get theme styles with fallback to default
 */
export function getThemeStyles(theme?: string): ThemeStyles {
  if (!theme || !(theme in THEME_CONFIGS)) {
    return THEME_CONFIGS.default;
  }
  return THEME_CONFIGS[theme as ThemeType];
}

/**
 * Apply additional inline styles for themes that need them (e.g., glass themes need specific backgrounds)
 */
export function getThemeInlineStyles(theme?: string): string {
  const themeType = (theme || 'default') as ThemeType;
  
  switch (themeType) {
    case 'glass':
      return 'background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%); backdrop-filter: blur(10px);';
    case 'glass-dark':
      return 'background: linear-gradient(135deg, rgba(30, 30, 50, 0.5) 0%, rgba(20, 20, 40, 0.6) 100%); backdrop-filter: blur(10px);';
    case 'vliz':
      return 'background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);';
    case 'vliz-dark':
      return 'background: linear-gradient(135deg, #1a2947 0%, #0f1729 100%);';
    default:
      return '';
  }
}

/**
 * Get skeleton loading colors based on theme
 */
export function getSkeletonColors(theme?: string): { background: string; shimmer: string } {
  const themeType = (theme || 'default') as ThemeType;
  
  switch (themeType) {
    case 'glass':
      return {
        background: 'rgba(255, 255, 255, 0.2)',
        shimmer: 'rgba(255, 255, 255, 0.4)'
      };
    case 'glass-dark':
      return {
        background: 'rgba(100, 100, 120, 0.3)',
        shimmer: 'rgba(150, 150, 170, 0.4)'
      };
    case 'vliz':
      return {
        background: '#e8ecf0',
        shimmer: '#f0f4f8'
      };
    case 'vliz-dark':
      return {
        background: 'rgba(49, 183, 188, 0.15)',
        shimmer: 'rgba(49, 183, 188, 0.25)'
      };
    default:
      return {
        background: '#e0e0e0',
        shimmer: '#f0f0f0'
      };
  }
}
