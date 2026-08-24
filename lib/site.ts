export const site = {
  name: "Mdivani Agency",
  personName: "Giorgi Mdivani",
  personRole: "Founder & Lead AI Engineer",
  url: "https://mdivani.agency",
  email: "info@mdivani.org",
  streetAddress: "L.Kvachadze 19",
  addressLocality: "Tbilisi",
  addressCountry: "GE",
  address: "L.Kvachadze 19, Tbilisi, Georgia",
  title: "Giorgi Mdivani — AI Engineering & Product Development",
  description:
    "Senior engineering for founders building new software and AI products. Work directly with Giorgi Mdivani — and with Mdivani Agency when the project needs a larger team.",
  ogTitle: "Giorgi Mdivani — AI Engineering for Founders",
  ogDescription:
    "Build your AI product from idea to production. Senior-led. Scalable when needed.",
  calendarUrl:
    "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3drXi2j_NDP1NqGMdu1qbA9mU7uF20M3rMGBQZCv9MeqUmMDAS7qYl6SiCpECQK16l_QV7iqW7?gv=true",
} as const;

export const navLinks = [
  { href: "/work", label: "Work", title: "Selected work" },
  { href: "/ai-engineering", label: "AI Engineering", title: "AI engineering" },
  {
    href: "/product-development",
    label: "Product Development",
    title: "Product development",
  },
  { href: "/about", label: "About", title: "About Giorgi Mdivani" },
] as const;

export const footerLinks = [
  ...navLinks,
  {
    href: "/startup-development",
    label: "Startup Development",
    title: "Startup and greenfield product development",
  },
] as const;

export const socialLinks = [
  {
    href: "https://www.linkedin.com/in/georgemdivani",
    label: "LinkedIn",
    title: "Giorgi Mdivani on LinkedIn",
  },
  {
    href: "https://www.linkedin.com/company/mdivani-solutions",
    label: "Mdivani Agency",
    title: "Mdivani Agency on LinkedIn",
  },
] as const;
