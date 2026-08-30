export const site = {
  name: "Mdivani Agency",
  personName: "Giorgi Mdivani",
  personRole: "Founder & Lead AI Engineer",
  url: "https://mdivani.agency",
  email: "giorgi@mdivani.agency",
  address: "L.Kvachadze 19, Tbilisi, Georgia",
  title: "Giorgi Mdivani — AI Engineering & Product Development",
  description:
    "Senior engineering for founders building new software and AI products. Work directly with Giorgi Mdivani — and with Mdivani Agency when the project needs a larger team.",
  ogTitle: "Giorgi Mdivani — AI Engineering for Founders",
  ogDescription:
    "Build your AI product from idea to production. Senior-led. Scalable when needed.",
  calendarUrl:
    "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3Rn1igds6-Z_TaCRCywo3EVAxGDz8k0D9nxaSAPLHx1hJ6tE6plEXMYRltlUVagVXCUcRvPa1Z?gv=true",
  toptalBadgeUrl:
    "https://www.toptal.com/developers/resume/giorgi-mdivani#N5k9PA",
} as const;

export const navLinks = [
  { href: "/work", label: "Selected Work", title: "Selected work" },
  { href: "/how-i-work", label: "How I Work", title: "How I work" },
  { href: "/about", label: "About", title: "About Giorgi Mdivani" },
  { href: "/contact", label: "Contact", title: "Contact" },
] as const;

export const footerLinks = [
  ...navLinks,
  {
    href: "/startup-development",
    label: "Startup Development",
    title: "Startup and greenfield product development",
  },
] as const;

export const profileLinks = [
  {
    href: "https://www.linkedin.com/in/georgemdivani",
    label: "LinkedIn",
    title: "Giorgi Mdivani on LinkedIn",
  },
  {
    href: "https://www.upwork.com/freelancers/~019fa0d78b5eea58a0",
    label: "Upwork",
    title: "Giorgi Mdivani on Upwork",
  },
  // {
  //   href: "https://www.toptal.com/developers/resume/giorgi-mdivani",
  //   label: "Toptal",
  //   title: "Giorgi Mdivani on Toptal",
  // },
  {
    href: "https://github.com/mdivani",
    label: "GitHub",
    title: "Giorgi Mdivani on GitHub",
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
