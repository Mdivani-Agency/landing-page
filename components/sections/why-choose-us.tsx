const reasons = [
  {
    title: "User Centric Approach",
    body: "We design with the end-user in mind, ensuring that every product we create enhances user experience and solves real-world problems",
  },
  {
    title: "Proven Expertise",
    body: "With years of hands-on experience and a diverse portfolio, our team brings a wealth of knowledge to every project we undertake.",
  },
  {
    title: "Scalable Growth",
    body: "Our solutions are built to grow with your business, providing flexibility and support as your needs evolve. ",
  },
] as const;

export function WhyChooseUs() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-center leading-1 mb-4 2xl:mb-8">
        Why Choose Us?
      </h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
        {reasons.map((reason) => (
          <div key={reason.title}>
            <article>
              <h3 className="text-title gradient-text md:mb-2">{reason.title}</h3>
              <p className="text-md">{reason.body}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
