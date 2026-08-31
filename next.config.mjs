/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  async redirects() {
    return [
      { source: "/hero", destination: "/", permanent: true },
      { source: "/hero/", destination: "/", permanent: true },
      {
        source: "/pravicy-statement",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/pravicy-statement/",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/pravicy-statement/index.html",
        destination: "/privacy-policy",
        permanent: true,
      },
      // Temporary only. /contact used to 308 to /; a new permanent
      // mapping would re-poison caches. Clients that never cached the
      // old 308 follow this 307 to /inquiry. Cached 308s still land on
      // / — all in-app CTAs therefore use /inquiry, which was never
      // permanently redirected.
      { source: "/contact", destination: "/inquiry", permanent: false },
      { source: "/contact/", destination: "/inquiry", permanent: false },
      {
        source: "/ai-engineering",
        destination: "/how-i-work",
        permanent: true,
      },
      {
        source: "/ai-engineering/",
        destination: "/how-i-work",
        permanent: true,
      },
      {
        source: "/product-development",
        destination: "/how-i-work",
        permanent: true,
      },
      {
        source: "/product-development/",
        destination: "/how-i-work",
        permanent: true,
      },
      {
        source: "/startup-development",
        destination: "/how-i-work",
        permanent: true,
      },
      {
        source: "/startup-development/",
        destination: "/how-i-work",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
