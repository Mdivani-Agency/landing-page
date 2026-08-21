import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "_site/**",
      "eleventy-dist/**",
      "src/**",
      ".yarn/**",
    ],
  },
  ...nextCoreWebVitals,
];

export default eslintConfig;
