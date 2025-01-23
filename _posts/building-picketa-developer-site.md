---
title: "Building the Picketa for Developers site"
excerpt: "How we leveraged modern tools like Next.js, AWS Amplify, and GitHub to build and deploy the Picketa for Developers site in a single morning, creating a platform for our engineering team to share their stories and insights."
coverImage: "/assets/blog/building-picketa-developer-site/cover.jpg"
date: "2025-01-22T12:11:21-04:00"
author: jseun
ogImage:
  url: "/assets/blog/building-picketa-developer-site/cover.jpg"
---

At Picketa, we believe in sharing our engineering journey and insights with the broader developer community. This morning, we set out to create a platform where our team could share their stories, technical insights, and lessons learned. However, we had some specific requirements that would make this more than just another company blog.

## Maintaining Our Developer Workflow

As engineers, we have a well-established workflow that promotes quality and collaboration:

1. We write code in our preferred IDEs, leveraging the tools and extensions we've carefully curated
2. We create Pull Requests on GitHub, where our work is versioned and tracked
3. We engage in code reviews, providing and receiving feedback that improves our code quality
4. We maintain ownership of our work, merging our changes when they meet our quality standards

When considering how to build our developer site, maintaining this workflow was crucial. We didn't want to introduce yet another tool or content management system that would:
- Force developers to leave their familiar environment
- Create separate user accounts and permissions
- Add complexity to our publishing process
- Fragment our collaboration across different platforms

Instead, we needed a solution that would:
- Allow writing content in markdown files, easily edited in any IDE
- Version control our content alongside our code
- Use Pull Requests for content reviews and collaboration
- Leverage our existing GitHub permissions and processes
- Deploy automatically when changes are merged
- Provide a foundation for our upcoming API documentation, which will be automatically updated through GitHub Actions

## Starting with a Template

We began with Vercel's excellent [blog-starter](https://github.com/vercel/next.js/tree/canary/examples/blog-starter) template, which provides a clean, performant foundation built with Next.js. Here's how to get started:

```bash
# Clone the blog starter template
npx create-next-app --example blog-starter picketa-developer-site

# Navigate to the project directory
cd picketa-developer-site

# Install dependencies
npm install

# Start the development server
npm run dev
```

The development server will start at `http://localhost:3000`, and you'll see the default blog template with example posts.

## Project Structure

The blog-starter template provides a well-organized structure, which we enhanced with our own additions:

```plaintext
picketa-developer-site/
├── _authors/           # Our addition: Author profiles
│   ├── jseun.md       # Sam Jean's profile
│   └── kasper.md      # JJ Kasper's profile
├── _posts/            # Markdown files for blog posts
├── public/
│   └── assets/       # Images and other static assets
├── src/
│   ├── app/          # Next.js 13 app directory
│   │   ├── page.tsx  # Home page
│   │   └── posts/    # Dynamic post routes
│   ├── interfaces/   # TypeScript interfaces
│   ├── lib/         # Utility functions
│   │   └── api.ts     # API functions for content
│   └── styles/      # Global styles
└── package.json
```

The `_authors` directory is our addition to the standard blog-starter template, allowing us to separate author information from the posts themselves. This makes it easier to maintain author profiles and reuse them across multiple posts.

## Customizing the Template

We made several enhancements to the default template to better suit our needs. Here are some examples of our customizations:

### Enhanced Post Headers

We modified the post header component to include author metadata and excerpts:

```tsx
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
```

### Author Profiles with Social Links

We created a dedicated PostFooter component to showcase author information and social links. Instead of embedding author details in each post, we moved them to separate markdown files in the `_authors` directory:

```tsx
type Props = {
  author: Author;
};

function SocialIcon({ type, url }: { type: string; url: string }) {
  const icons = {
    github: <svg>...</svg>,
    twitter: <svg>...</svg>,
    linkedin: <svg>...</svg>,
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-neutral-600 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
      aria-label={`Visit ${type} profile`}
    >
      {icons[type as keyof typeof icons]}
    </a>
  );
}

export function PostFooter({ author }: Props) {
  return (
    <PostSection className="mt-16 border-t border-neutral-200 dark:border-neutral-800">
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">About the Author</h2>
        <div className="flex items-start gap-6">
          <Image
            src={author.picture}
            alt={author.name}
            className="rounded-full"
            width={80}
            height={80}
          />
          <div>
            <h3 className="text-xl font-semibold mb-1">{author.name}</h3>
            {author.role && (
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                {author.role}
              </p>
            )}
            {author.bio && <p className="mb-4">{author.bio}</p>}
            {author.social && (
              <div className="flex gap-4">
                {author.social.github && (
                  <SocialIcon type="github" url={author.social.github} />
                )}
                {author.social.twitter && (
                  <SocialIcon type="twitter" url={author.social.twitter} />
                )}
                {author.social.linkedin && (
                  <SocialIcon type="linkedin" url={author.social.linkedin} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PostSection>
  );
}
```

Author information is stored in markdown files with their own frontmatter:

```markdown
---
name: Sam Jean
picture: "/assets/blog/authors/jseun.jpeg"
role: VP of Engineering
bio: Building the future of agricultural technology at Picketa
social:
  github: https://github.com/jseun
  linkedin: https://www.linkedin.com/in/sam-jean-30666926a/
---
```

This separation of concerns makes it easy to:
- Update author information in one place
- Add new authors without touching the code
- Keep author profiles consistent across posts
- Manage social links independently

## Update API Functions for Authors

We added new functions to our `api.ts` to handle author data:

```typescript
import { join } from 'path'
import { Author } from '@/interfaces/author'
import matter from 'gray-matter'
import fs from 'fs'

const authorsDirectory = join(process.cwd(), '_authors')

export function getAuthorBySlug(slug: string): Author {
  const fullPath = join(authorsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data } = matter(fileContents)

  return {
    name: data.name,
    picture: data.picture,
    role: data.role,
    bio: data.bio,
    social: data.social,
  }
}

export function getAllAuthors(): Author[] {
  const slugs = fs.readdirSync(authorsDirectory)
  const authors = slugs.map((slug) => {
    const authorSlug = slug.replace(/\.md$/, '')
    return getAuthorBySlug(authorSlug)
  })
  return authors
}

// Update getPostBySlug to use author slugs
export function getPostBySlug(slug: string) {
  const fullPath = join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // Get full author data from slug
  const author = getAuthorBySlug(data.author)

  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    date: data.date,
    author,
    content,
    ogImage: data.ogImage,
  }
}
```

## Managing Content with Markdown

One of the key advantages of our setup is the simplicity of content management through Markdown. This approach means:

- Engineers can write posts in their preferred code editor
- Content goes through the same review process as code
- Version control tracks all content changes
- No need to learn a new CMS interface

Here's how a typical blog post is structured:

```markdown
---
title: "Your Post Title"
excerpt: "A brief description of your post"
coverImage: "/assets/blog/your-post/cover.jpg"
date: "2025-01-22T12:00:00-04:00"
author: your-author-id
---

Your post content goes here...

## Sections

Use markdown formatting for:
- Lists
- **Bold text**
- `code snippets`
- And more...
```

The frontmatter (the YAML section between `---`) defines metadata about the post, while the content below uses standard markdown syntax. This format is:

- **Familiar**: Most developers already know markdown from writing documentation
- **Flexible**: Supports rich formatting including code blocks, tables, and images
- **Portable**: Content can be easily moved or repurposed
- **Reviewable**: Changes are clearly visible in Pull Requests

We store all posts in the `_posts` directory, with each file named using kebab-case (e.g., `building-picketa-developer-site.md`). Images and other assets are organized in the `public/assets/blog` directory, keeping everything neat and accessible.

## Seamless Deployment with AWS Amplify

One of our key requirements was keeping deployment simple and automated, fitting naturally into our Git workflow. AWS Amplify Console was the perfect solution because it:

1. Integrates directly with our GitHub repository
2. Deploys automatically when changes are merged to main
3. Provides built-in support for Next.js applications

Setting up deployment was straightforward:

1. Navigate to AWS Amplify Console
2. Click "Create new app" and choose GitHub as the Git provider
3. Connect your GitHub repository and select the main branch
4. Let Amplify detect the Next.js app and configure build settings
5. Review and confirm the deployment

After this initial setup, our deployment process became entirely Git-driven:
1. Write a new blog post in markdown
2. Create a Pull Request
3. Get feedback from the team (can checkout the branch and view the post locally with `npm run dev`)
4. Merge to main
5. Amplify automatically deploys the changes

This workflow means our content goes through the same quality checks as our code, and we never have to worry about manual deployments or content synchronization. Running NextJS locally is useful for reviewing how posts will look in production before merging.

You could also deploy to Vercel or Netlify if you prefer, but AWS Amplify is a great choice for our needs as that's where our application is hosted.

## Looking Forward

This site will serve as a platform for our engineering team to share:

- Technical insights and learnings
- Project retrospectives
- Engineering culture stories
- Open source contributions
- Our API specification

By leveraging Next.js, GitHub, and AWS Amplify, we were able to create this platform in just one morning. It's a testament to how far web development tools have come and how a well-chosen tech stack can help teams move quickly without sacrificing quality.

We're excited to start sharing our engineering journey at Picketa, where we're building the future of agricultural technology. Stay tuned for more posts from our team!
