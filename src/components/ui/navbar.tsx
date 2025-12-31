'use client';

import { ListIcon, MapPinIcon, MoonIcon, SunIcon, XIcon } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { ME } from '@/data/me';
import { useScrolled } from '@/lib/hooks/use-scrolled';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
] as const;

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = useScrolled({ threshold: 50 });

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
      <nav className="mx-auto max-w-6xl">
        <motion.div
          layout
          className={cn(
            'relative flex items-center justify-between gap-4 px-2 py-2 md:px-3 md:py-2',
            isScrolled && 'glass rounded-2xl px-4 py-3 md:px-6 md:py-4',
          )}
          transition={SPRING_TRANSITION}
        >
          {/* Unified glass background - only visible when scrolled */}
          <AnimatePresence>
            {isScrolled && (
              <motion.div
                layoutId="navbar-glass"
                className="absolute inset-0 glass rounded-2xl -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* Logo with glass pill */}
          <motion.div className="relative" layout transition={SPRING_TRANSITION}>
            <AnimatePresence>
              {!isScrolled && (
                <motion.div
                  layoutId="logo-pill"
                  className="absolute -inset-2 glass rounded-full -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={SPRING_TRANSITION}
                />
              )}
            </AnimatePresence>
            <Link to="/" className="group relative flex items-center gap-2 px-2 py-2">
              <span className="font-serif text-base md:text-lg tracking-wider">HEZAERD</span>
            </Link>
          </motion.div>

          {/* Navigation Links - with glass pill when not scrolled */}
          <motion.div className="relative hidden md:block" layout transition={SPRING_TRANSITION}>
            <AnimatePresence>
              {!isScrolled && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -inset-1.5 glass rounded-full -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={SPRING_TRANSITION}
                />
              )}
            </AnimatePresence>
            <ul className="flex items-center gap-0.5 px-1 py-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium',
                      'text-muted-foreground hover:text-foreground',
                      'hover:bg-white/10 transition-all duration-200',
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right side: Location + Theme Toggle + Mobile Menu */}
          <motion.div className="relative" layout transition={SPRING_TRANSITION}>
            <AnimatePresence>
              {!isScrolled && (
                <motion.div
                  layoutId="actions-pill"
                  className="absolute -inset-1.5 glass rounded-full -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={SPRING_TRANSITION}
                />
              )}
            </AnimatePresence>
            <div className="flex items-center gap-2 px-1 py-0.5">
              {/* Location badge - hidden on mobile */}
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground px-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{ME.location.split(',')[0]}</span>
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-foreground/10" />

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className={cn('p-2 rounded-full', 'hover:bg-white/10', 'transition-colors duration-200')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </motion.div>
              </motion.button>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn('md:hidden p-2 rounded-full', 'hover:bg-white/10', 'transition-colors duration-200')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <ListIcon className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={SPRING_TRANSITION}
              className="md:hidden mt-2 overflow-hidden"
            >
              <div className="glass rounded-2xl px-4 py-4">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-3 rounded-xl text-sm font-medium',
                          'text-muted-foreground hover:text-foreground',
                          'hover:bg-white/5 transition-all duration-200',
                        )}
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>

                {/* Mobile location */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground border-t border-foreground/10 mt-2"
                >
                  <MapPinIcon className="w-4 h-4" />
                  <span>{ME.location}</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
