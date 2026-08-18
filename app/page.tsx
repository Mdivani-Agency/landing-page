export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-4 text-center">
      <h1 className="text-xl font-semibold leading-1 md:text-2xl">
        Mdivani — Next.js migration
      </h1>
      <p className="max-w-xl text-md opacity-70">
        Design tokens, global CSS, and Roboto are loaded. The landing-page
        sections will be ported in the following migration tasks.
      </p>
      <p className="gradient-text text-title font-semibold">
        Token check: title size and gradient text
      </p>
    </main>
  );
}
