---
title: "Building the Picketa for Developers site"
excerpt: "How we leveraged modern tools like Vercel's blog-starter, AWS Amplify, and Windsurf with Cascade to build and deploy the Picketa for Developers site in a single morning, creating a platform for our engineering team to share their stories and insights."
coverImage: "/assets/blog/building-picketa-developer-site/cover.jpg"
date: "2025-01-22T12:11:21-04:00"
author:
  name: Sam Jean
  picture: "/assets/blog/authors/jseun.jpeg"
ogImage:
  url: "/assets/blog/building-picketa-developer-site/cover.jpg"
---

When we set out to create a platform for Picketa's engineering team to share their stories and insights, we wanted something that would be both elegant and efficient to build. This morning, we accomplished exactly that by combining several powerful modern tools.

## Starting with a Solid Foundation

We began with Vercel's excellent [blog-starter](https://github.com/vercel/next.js/tree/canary/examples/blog-starter) template, which provides a clean, performant foundation built with Next.js. This gave us several advantages out of the box:

- Static site generation for optimal performance
- Markdown-based content management
- Built-in TypeScript support
- Clean, minimal design

## Quick Deployment with AWS Amplify

One of our key requirements was simple deployment and hosting. AWS Amplify made this incredibly straightforward:

1. Connected our GitHub repository to Amplify
2. Configured the build settings
3. Deployed directly from our main branch

The entire process took minutes, and now our site automatically deploys whenever we push changes to the repository.

## Enhancing the Design with Windsurf and Cascade

The real magic happened when we used Windsurf, powered by Cascade. These tools allowed us to:

- Quickly adapt the design to match Picketa's branding
- Implement dark mode support
- Create a responsive, modern layout
- Fine-tune components for better user experience

Cascade's AI capabilities were particularly helpful in rapidly iterating through design changes. We could describe what we wanted, and Cascade would help implement the changes efficiently.

## Content Management Through Markdown

Our posts are written in Markdown, which means:

- Engineers can write content using their preferred text editors
- Version control handles content changes naturally
- Posts can include code snippets with syntax highlighting
- Content is easily portable and future-proof

## Looking Forward

This site will serve as a platform for our engineering team to share:

- Technical insights and learnings
- Project retrospectives
- Engineering culture stories
- Open source contributions

By leveraging modern tools and embracing automation, we were able to create this platform in just one morning. It's a testament to how far development tools have come and how they can help teams move quickly without sacrificing quality.

We're excited to start sharing our engineering journey at Picketa, where we're building the future of agricultural technology. Stay tuned for more posts from our team!
