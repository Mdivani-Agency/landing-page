/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  async redirects() {
    return [
      { source: "/hero", destination: "/", permanent: true },
      { source: "/hero/", destination: "/", permanent: true },
      { source: "/contact", destination: "/", permanent: true },
      { source: "/contact/", destination: "/", permanent: true },
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
    ];
  },
};

export default nextConfig;
