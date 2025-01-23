import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  excerpt?: string;
};

export function PostTitle({ children, excerpt }: Props) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight md:leading-none mb-4 text-center md:text-left">
        {children}
      </h1>
      {excerpt && (
        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed text-center md:text-left">
          {excerpt}
        </p>
      )}
    </div>
  );
}
