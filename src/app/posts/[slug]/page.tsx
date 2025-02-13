import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import { SITE_URL } from "@/lib/constants";
import { generateMetadata as baseGenerateMetadata, generateOgImageUrl } from "@/lib/metadata";
import Alert from "@/app/_components/alert";
import Container from "@/app/_components/container";
import { Intro } from "@/app/_components/intro";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";
import { PostFooter } from "@/app/_components/post-footer";

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <main>
      <Alert preview={post.preview} />
      <Container>
        <Intro />
        <article className="max-w-4xl mx-auto mb-32">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            excerpt={post.excerpt}
          />
          <PostBody content={content} />
          <PostFooter author={post.author} />
        </article>
      </Container>
    </main>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const ogImageUrl = generateOgImageUrl({
    title: post.title,
    authorName: post.author?.name,
    authorPicture: post.author?.picture,
    authorRole: post.author?.role,
    backgroundImage: post.ogImage?.url,
  });

  return baseGenerateMetadata({
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/posts/${post.slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      images: [ogImageUrl],
    },
  });
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
