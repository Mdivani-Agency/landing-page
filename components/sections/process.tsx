import Image from "next/image";

const steps = [
  {
    title: "Discovery and Strategy",
    body: "We begin by identifying your unique challenges and goals, ensuring we create solutions tailored to your business. ",
    icon: "/assets/images/cpu.png",
    alt: "CPU Icon",
  },
  {
    title: "Design and Prototyping",
    body: "We craft detailed prototypes and user-focused designs to visualize the end product and refine functionalities. ",
    icon: "/assets/images/pallete.png",
    alt: "Pallete Icon",
  },
  {
    title: "Development and Testing",
    body: "Our team builds robust systems, rigorously testing for quality, performance, and seamless integration. ",
    icon: "/assets/images/science.png",
    alt: "Science Icon",
  },
  {
    title: "Launch and Optimization",
    body: "We deploy your solution, monitor performance, and fine-tune for long-term success and scalability. ",
    icon: "/assets/images/rocket.png",
    alt: "Rocket Icon",
  },
] as const;

export function Process() {
  return (
    <section className="relative">
      <figure className="absolute figure -right-[50%] -top-[50%] bg-[#0685EA]" />
      <h2 className="text-xl font-semibold leading-1 text-center mb-4 2xl:mb-8">
        Our Process
      </h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="text-box border border-[0.5px] border-gray-100 rounded-md p-2 md:p-4"
          >
            <figure className="size-4 mb-2">
              <Image src={step.icon} alt={step.alt} width={80} height={80} />
            </figure>
            <article>
              <h3 className="text-title mb-1">{step.title}</h3>
              <p className="text-sm">{step.body}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
