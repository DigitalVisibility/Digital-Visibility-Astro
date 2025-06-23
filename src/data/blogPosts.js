// Centralized blog posts data
// Add new blog posts here and they'll automatically appear on the blog page and relevant category pages

export const blogPosts = [
  {
    title: "Why UK Businesses Are Ditching Zapier for AI Conversation Automation",
    slug: "why-uk-businesses-ditching-zapier-ai-conversation-automation",
    excerpt: "Discover why forward-thinking UK businesses are moving beyond traditional workflow builders like Zapier to revolutionary AI conversation automation. Learn how talking to AI is replacing complex drag-and-drop workflows.",
    category: "AI Automation",
    categorySlug: "ai-automation",
    image: "https://imagedelivery.net/xUD9jGQuj6OKHFKJ8WGwXA/63f967f0-ffcd-4712-4019-1247367b3500/public",
    alt: "AI conversation automation interface showing natural language commands replacing complex workflow builders for UK businesses",
    date: "June 6, 2025",
    author: "Darran Goulding",
    authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
    featured: true,
    tags: ["AI Automation", "Claude MCP", "Business Automation", "UK Business", "Workflow Optimization"]
  },
  {
    title: "10 Essential SEO Strategies for 2025",
    slug: "10-essential-seo-strategies-2025",
    excerpt: "Master the 10 crucial SEO strategies that will dominate 2025. From AI-driven content to voice search optimization - learn how to implement these proven tactics to boost your rankings and traffic.",
    category: "SEO",
    categorySlug: "seo",
    image: "https://huskycarecorner.com/autopilot/3/10-key-seo-strategies-for-2025-implementation-wct.jpg",
    alt: "Digital Visibility SEO expert guide: 10 essential SEO strategies for 2025 including AI optimization, voice search, and mobile-first indexing for Swansea businesses",
    date: "December 15, 2024",
    author: "Darran Goulding",
    authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
    featured: true,
    tags: ["SEO Strategies", "AEO", "Voice Search", "Mobile SEO", "AI Content", "Local SEO"]
  },
  {
    title: "How AI is Revolutionizing Website Design in 2025",
    slug: "how-ai-is-revolutionizing-website-design",
    excerpt: "Discover how artificial intelligence is transforming web design, making websites more personalized, accessible, and efficient. Learn about the latest AI tools and trends reshaping the digital landscape.",
    category: "Web Design",
    categorySlug: "web-design",
    image: "https://huskycarecorner.com/autopilot/3/how-ai-is-revolutionising-web-design-mmu.jpg",
    alt: "Professional web designer at Digital Visibility Swansea working with AI tools to create responsive website layouts and mobile-optimized designs for UK businesses",
    date: "April 29, 2025",
    author: "Darran Goulding",
    authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
    featured: true,
    tags: ["Web Design", "AI Design Tools", "Responsive Design", "UX Design", "Website Development"]
  }
];

// Category information for SEO and organization
export const categoryInfo = {
  'ai-automation': {
    name: 'AI Automation',
    description: 'Discover how AI conversation automation is revolutionizing business operations. Learn about Claude MCP, workflow optimization, and cutting-edge automation strategies for UK businesses.',
    keywords: 'AI automation, conversation automation, Claude MCP, business automation, workflow optimization, UK AI solutions',
    color: 'blue'
  },
  'web-design': {
    name: 'Web Design',
    description: 'Explore the latest web design trends, AI-powered design tools, and innovative techniques for creating stunning, user-friendly websites that convert visitors into customers.',
    keywords: 'web design, AI web design, responsive design, UX design, website development, Swansea web design',
    color: 'purple'
  },
  'seo': {
    name: 'SEO',
    description: 'Master search engine optimization with expert strategies, AEO techniques, and proven tactics to boost your website rankings and organic traffic in 2025.',
    keywords: 'SEO strategies, search engine optimization, AEO, GEO, local SEO, SEO tips, Swansea SEO',
    color: 'green'
  },
  'digital-marketing': {
    name: 'Digital Marketing',
    description: 'Comprehensive digital marketing insights covering strategy, implementation, and optimization for maximum business growth and ROI.',
    keywords: 'digital marketing, marketing strategy, online marketing, marketing automation, UK digital marketing',
    color: 'orange'
  },
  'app-development': {
    name: 'App Development',
    description: 'Learn about mobile app development, AI-powered applications, and software development best practices for modern businesses.',
    keywords: 'app development, mobile apps, software development, AI applications, custom apps',
    color: 'indigo'
  },
  'product-design': {
    name: 'Product Design',
    description: 'Insights into product design, CAD engineering, 3D modeling, and innovative product development processes for manufacturing excellence.',
    keywords: 'product design, CAD design, 3D modeling, product development, engineering, manufacturing',
    color: 'red'
  }
};

// Helper functions
export function getPostsByCategory(categorySlug) {
  return blogPosts.filter(post => post.categorySlug === categorySlug);
}

export function getFeaturedPosts() {
  return blogPosts.filter(post => post.featured);
}

export function getRecentPosts(limit = 5) {
  return blogPosts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function getPostBySlug(slug) {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllCategories() {
  const categories = [...new Set(blogPosts.map(post => post.categorySlug))];
  return categories.map(slug => ({
    slug,
    ...categoryInfo[slug],
    count: getPostsByCategory(slug).length
  }));
}

// Instructions for adding new blog posts:
// 1. Add your new blog post object to the blogPosts array above
// 2. Make sure to include all required fields: title, slug, excerpt, category, categorySlug, image, alt, date, author, authorImage
// 3. Add appropriate tags for better organization
// 4. Set featured: true if you want it to appear in featured sections
// 5. The blog post will automatically appear on the main blog page and relevant category page 