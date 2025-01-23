import markdownStyles from "./markdown-styles.module.css";
import { PostSection } from "@/app/_components/post-section";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  return (
    <PostSection>
      <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </PostSection>
  );
}
