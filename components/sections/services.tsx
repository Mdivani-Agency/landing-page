export function Services() {
  return (
    <section id="services" className="relative flex flex-col justify-center">
      <figure className="absolute figure -left-[50%] bg-[#2aecbb4d]" />
      <h2 className="text-xl font-semibold leading-1 text-center mb-4 2xl:mb-8">
        Explore Our Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="text-box grid grid-cols-3 border border-[0.5px] border-gray-100 rounded-md p-2 md:p-4">
          <figure className="col-span-3 md:col-span-1 md:order-last">
            <img
              className="block mx-auto w-auto h-30"
              src="/assets/images/cloud.png"
              alt="Cloud Icon"
            />
          </figure>
          <article className="col-span-3 md:col-span-2 pr-1">
            <h3 className="text-title mb-1">
              Custom Software
              <br />
              Solutions
            </h3>
            <p className="text-md">
              Don&apos;t get bogged down in lengthy development cycles and
              inflated costs. We build custom software solutions designed
              specifically for startups, prioritizing speed, cost-effectiveness,
              and future scalability
            </p>
          </article>
        </div>

        <div className="text-box flex flex-col border border-[0.5px] border-gray-100 rounded-md p-2 md:p-4 row-span-2">
          <figure className="mt-auto">
            <img
              className="block mx-auto w-auto h-30 md:h-32 md:ml-auto"
              src="/assets/images/db.png"
              alt="Database Icon"
            />
          </figure>
          <article className="w-full mt-auto pr-1">
            <h3 className="text-title mb-1">
              Strategic Tech Guidance for Startup Success
            </h3>
            <p className="text-md">
              Navigating the complex world of technology can be overwhelming for
              startups. Let us be your guide. We provide strategic technology
              consulting services tailored to your unique needs, helping you
              make informed decisions about your tech stack, avoid costly
              mistakes, and build a sustainable foundation for your business.
            </p>
          </article>
        </div>

        <div className="text-box grid grid-cols-3 border border-[0.5px] border-gray-100 rounded-md p-2 md:p-4">
          <figure className="col-span-3 flex items-center justify-center md:col-span-1 md:order-last">
            <img
              className="block mx-auto w-auto h-30"
              src="/assets/images/react.png"
              alt="React Icon"
            />
          </figure>
          <article className="col-span-3 md:col-span-2 pr-1">
            <h3 className="text-title mb-1">
              Web &amp; Mobile Application
              <br />
              Development
            </h3>
            <p className="text-md">
              Reach your target audience across all devices with our expert web
              and mobile application development services. We utilize React
              Native, a cutting-edge framework, to build native-quality apps for
              both iOS and Android from a single codebase.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
