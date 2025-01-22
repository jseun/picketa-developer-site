import Container from "@/app/_components/container";

export function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
      <Container>
        <div className="py-28 flex flex-col lg:flex-row items-center">
          <h3 className="text-4xl lg:text-[2.5rem] font-bold tracking-tighter leading-tight text-center lg:text-left mb-10 lg:mb-0 lg:pr-4 lg:w-1/2">
            Want to be part of our story?
          </h3>
          <div className="flex flex-col lg:flex-row justify-center items-center lg:pl-4 lg:w-1/2">
            <a
              href="https://www.picketa.com/company"
              className="mx-3 bg-neutral-800 hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-800 font-bold py-3 px-12 lg:px-8 duration-200 transition-colors mb-6 lg:mb-0"
            >
              Join Our Team
            </a>
            <a
              href="https://github.com/Picketa/picketa-developer-site"
              className="mx-3 font-bold hover:text-blue-600 dark:hover:text-blue-400"
            >
              Fork on GitHub
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
