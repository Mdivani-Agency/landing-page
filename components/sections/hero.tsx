import { PrimaryButton } from "@/components/primary-button";

export function Hero() {
  return (
    <section
      id="home"
      className="section text-center gap-3 flex flex-col justify-center items-center 2xl:gap-4"
    >
      <h1 className="text-xl lg:text-2xl 2xl:text-3xl font-semibold leading-1">
        Launch Your Dream App
        <br /> From Idea to Market, We&apos;ve Got You Covered
      </h1>
      <p className="text-sm md:text-title font-regular">
        We build scalable, user-centric web and mobile applications using
        cutting-edge
        <br /> technologies like React Native, Node.js, and AWS
      </p>
      <PrimaryButton>Get a Free Consultation</PrimaryButton>
    </section>
  );
}
