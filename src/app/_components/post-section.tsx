import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function PostSection({ children, className = "" }: Props) {
  return (
    <div className={`mb-12 -mx-4 sm:mx-0 ${className}`}>
      {children}
    </div>
  );
}
