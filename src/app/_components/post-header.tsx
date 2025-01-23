import Avatar from "./avatar";
import CoverImage from "./cover-image";
import { PostTitle } from "@/app/_components/post-title";
import { PostSection } from "@/app/_components/post-section";
import { type Author } from "@/interfaces/author";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: Author;
  excerpt: string;
};

export function PostHeader({ title, coverImage, date, author, excerpt }: Props) {
  return (
    <>
      <PostTitle excerpt={excerpt}>{title}</PostTitle>
      <div className="mb-8">
        <Avatar name={author.name} picture={author.picture} date={date} />
      </div>
      <PostSection>
        <CoverImage title={title} src={coverImage} />
      </PostSection>
    </>
  );
}
