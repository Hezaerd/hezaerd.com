export const site = {
  siteUrl: import.meta.env.VITE_SITE_URL ?? "https://hezaerd.com",
  portfolioUrl: import.meta.env.VITE_PORTFOLIO_URL ?? "https://portfolio.hezaerd.com",
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL ?? "hezaerd@hezaerd.com",
};

export const brandNav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;
