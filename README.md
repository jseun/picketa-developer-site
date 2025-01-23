# Picketa for Developers

This is the official developer site for Picketa Systems, where our engineering team shares insights, experiences, and technical knowledge. Built with Next.js and deployed on AWS Amplify, this site serves as both our engineering blog and upcoming API documentation platform.

## Purpose

- Share our engineering journey and technical insights
- Document our solutions to complex agricultural technology challenges
- Provide up-to-date API documentation for our services
- Foster collaboration and knowledge sharing within the agtech community

## Features

- Markdown-based content management
- Author profiles with social links
- Responsive design
- Dark mode support
- Automated deployment through AWS Amplify

## Getting Started

Start by forking the repository on GitHub then clone it to your local machine:

```bash
# Clone the repository
git clone https://github.com/<your-username>/picketa-developer-site.git

# Navigate to the project directory
cd picketa-developer-site

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the site.

## Contributing

### Adding a New Post

1. Create a new markdown file in `_posts/` using kebab-case naming
2. Include the required frontmatter:
   ```markdown
   ---
   title: "Your Post Title"
   excerpt: "Brief description of your post"
   coverImage: "/assets/blog/your-post/cover.jpg"
   date: "YYYY-MM-DDTHH:mm:ss-04:00"
   author: your-author-id
   ogImage:
     url: "/assets/blog/your-post/cover.jpg"
   ---
   ```
3. Write your content in markdown
4. Create a Pull Request for review

### Adding an Author

1. Create a new markdown file in `_authors/` (e.g., `your-name.md`)
2. Include the required frontmatter:
   ```markdown
   ---
   name: "Your Name"
   picture: "/assets/blog/authors/your-picture.jpeg"
   role: "Your Role"
   bio: "Your bio"
   social:
     github: "https://github.com/yourusername"
     linkedin: "https://linkedin.com/in/yourusername"
     twitter: "https://twitter.com/yourusername"
   ---
   ```

## Development

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Content managed with Markdown
- Deployed on [AWS Amplify](https://aws.amazon.com/amplify/)

## License

Copyright 2025 Picketa Systems. All rights reserved.
