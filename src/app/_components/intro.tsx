import SmallLogo from "@/assets/small-logo";
import Link from "next/link";

export function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <div className="md:pr-8">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity duration-200">
          <SmallLogo />
          <span className="text-3xl font-bold">
            <span className="text-neutral-800 dark:text-white">Picketa</span>
            <span className="text-neutral-600 dark:text-neutral-300"> for Developers</span>
          </span>
        </Link>
      </div>
      <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
        Stories and insights from the engineering team at{" "}
        <a
          href="https://www.picketa.com/"
          className="font-bold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 duration-200 transition-colors"
        >
          Picketa
        </a>
        , where we're building the future of agricultural technology.
      </h4>
    </section>
  );
}
