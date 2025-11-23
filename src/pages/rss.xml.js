import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET(context) {
  // Get all blog posts from src/pages/blog/
  const blogPosts = import.meta.glob('./blog/*.{md,astro}', { eager: true });

  const posts = [];

  // Process each blog post
  for (const [path, post] of Object.entries(blogPosts)) {
    // Skip index, category pages, and any non-blog content
    if (path.includes('index.astro') || path.includes('category')) {
      continue;
    }

    // Extract slug from file path
    const slug = path.split('/').pop().replace(/\.(md|astro)$/, '');

    let postData = {};

    // Handle .md files with frontmatter
    if (post.frontmatter) {
      // Get full content for AI crawlers
      const content = post.compiledContent ? await post.compiledContent() : '';

      postData = {
        title: post.frontmatter.title,
        pubDate: new Date(post.frontmatter.pubDate || post.frontmatter.publishDate),
        description: post.frontmatter.description,
        link: `/blog/${post.frontmatter.slug || slug}/`,
        content: content, // Full content for AI crawlers
        author: post.frontmatter.author?.name || 'Darran Goulding',
        categories: post.frontmatter.tags || post.frontmatter.category ? [post.frontmatter.category] : [],
      };
    }
    // Handle .astro files with post object (check if it's exported)
    else if (post.post) {
      postData = {
        title: post.post.title,
        pubDate: new Date(post.post.publishDate || post.post.pubDate),
        description: post.post.description,
        link: `/blog/${post.post.slug || slug}/`,
        content: post.post.description, // Use description as fallback for .astro files
        author: post.post.author || 'Darran Goulding',
        categories: post.post.category ? [post.post.category] : [],
      };
    }

    // Only add if we have valid data
    if (postData.title && postData.pubDate) {
      posts.push(postData);
    }
  }

  // Sort by date (newest first)
  posts.sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: 'Digital Visibility Blog',
    description: 'AI-powered SEO strategies, automation, and digital marketing insights',
    site: context.site,
    items: posts,
    customData: `<language>en-GB</language>`,
  });
}
