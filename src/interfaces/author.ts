export type Author = {
  name: string;
  picture: string;
  role?: string;
  bio?: string;
  social?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
};
