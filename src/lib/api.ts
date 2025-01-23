import { Post } from "@/interfaces/post";
import { Author } from "@/interfaces/author";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");
const authorsDirectory = join(process.cwd(), "_authors");

export function getAuthorSlugs() {
  return fs.readdirSync(authorsDirectory);
}

export function getAuthorBySlug(slug: string): Author {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(authorsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);

  return { ...data } as Author;
}

export function getAllAuthors(): Author[] {
  const slugs = getAuthorSlugs();
  return slugs.map((slug) => getAuthorBySlug(slug));
}

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Convert author name to slug and load full author data
  const authorSlug = data.author.toLowerCase().replace(/\s+/g, "-");
  const author = getAuthorBySlug(`${authorSlug}.md`);

  return { 
    ...data, 
    slug: realSlug, 
    content,
    author 
  } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
