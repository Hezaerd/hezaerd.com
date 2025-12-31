import { createContext, type PropsWithChildren, useContext, useState } from 'react';
import { setThemeFn, type Theme } from '@/fn/theme';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = PropsWithChildren<{ theme: Theme }>;

export function ThemeProvider({ children, theme: initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  function setTheme(value: Theme) {
    setThemeState(value);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(value);

    setThemeFn({ data: value });
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
