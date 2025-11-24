// Centralized blog posts data
// Add new blog posts here and they'll automatically appear on the blog page and relevant category pages

export const blogPosts = [
  {
    title: "How Google Uses Gemini III for Complex Queries",
    slug: "google-gemini-iii-complex-queries",
    excerpt: "Discover how Google's Gemini III is transforming complex search queries with innovative AI solutions. Learn about its impact on search experiences.",
    category: "Digital Marketing",
    categorySlug: "digital-marketing",
    image: "https://tempfile.aiquickdraw.com/s/6079b6b4e6813b82c0746a7908935b6c_0_1763939226_7755.png",
    alt: "How Google Uses Gemini III for Complex Queries",
    date: "November 23, 2025",
    author: "Darran Goulding",
    authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
    featured: false,
    tags: ["Gemini III", "Google Search", "AI Search", "Complex Queries", "Search Technology"]
  },
  {
    title: "How Local Businesses Can Crush Competitors Using Claude 4 Extended Thinking Capabilities",
    slug: "how-local-businesses-can-crush-competitors-using-claude-4-extended-thinking-capabilities",
    excerpt: "Discover how Claude 4's extended thinking capabilities help local businesses outperform competitors through AI-driven strategies, automated competitor analysis, and smart pricing optimization.",
    category: "AI Automation",
    categorySlug: "ai-automation",
    image: "/Blog hero image for claude thinking.webp",
    alt: "Local business owner using Claude 4 AI extended thinking capabilities to analyze competitors and develop strategic business plans on laptop screen",
    date: "July 10, 2025",
    author: "Darran Goulding",
    authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
    featured: true,
    tags: ["Claude 4", "Extended Thinking", "Local Business", "AI Automation", "Competitor Analysis", "Business Strategy"]
  },
  {
    title: "How Should Your Business Adapt to Google's Latest Search Engine Update?",
    slug: "how-should-your-business-adapt-to-googles-latest-search-engine-update",
    excerpt: "Discover how your business can adapt to Google's latest June 2025 search engine update through expert-led content, technical optimization, and multi-platform visibility.",
    category: "SEO",
    categorySlug: "seo",
    image: "/how should business adapt to googles latest update.webp",
    alt: "Google June 2025 core update analysis showing search engine algorithm changes and business adaptation strategies for SEO optimization",
    date: "June 30, 2025",
    author: "Darran Goulding",
    authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
    featured: true,
    tags: ["Google Update", "Core Update", "SEO Strategy", "Algorithm Changes", "Technical SEO", "Content Strategy"]
  },
  {
    title: "Why UK Businesses Ditch Zapier for AI Automation",
    slug: "why-uk-businesses-ditching-zapier-ai-conversation-automation",
    excerpt: "Forward-thinking UK businesses move beyond Zapier to AI conversation automation. Learn how talking to AI replaces complex drag-and-drop workflows.",
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
    excerpt: "Master 10 crucial SEO strategies dominating 2025. AI-driven content to voice search optimization - implement proven tactics to boost rankings & traffic.",
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
    title: "How AI Revolutionizes Website Design in 2025",
    slug: "how-ai-is-revolutionizing-website-design",
    excerpt: "AI transforms web design, making websites more personalized, accessible & efficient. Latest AI tools and trends reshaping the digital landscape.",
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
    description: 'AI conversation automation revolutionizing UK business operations. Claude MCP, workflow optimization & cutting-edge automation strategies for growth.',
    keywords: 'AI automation, conversation automation, Claude MCP, business automation, workflow optimization, UK AI solutions',
    color: 'blue'
  },
  'web-design': {
    name: 'Web Design',
    description: 'Latest web design trends, AI-powered tools & innovative techniques for creating stunning, user-friendly websites that convert visitors.',
    keywords: 'web design, AI web design, responsive design, UX design, website development, Swansea web design',
    color: 'purple'
  },
  'seo': {
    name: 'SEO',
    description: 'Master SEO with expert strategies, AEO techniques & proven tactics to boost website rankings and organic traffic in 2025.',
    keywords: 'SEO strategies, search engine optimization, AEO, GEO, local SEO, SEO tips, Swansea SEO',
    color: 'green'
  },
  'aeo': {
    name: 'AEO',
    description: 'Answer Engine Optimization strategies to rank in AI-powered search engines like ChatGPT, Perplexity & Claude. Optimize for AI answers.',
    keywords: 'AEO, answer engine optimization, AI search, ChatGPT optimization, Perplexity SEO, AI engine optimization',
    color: 'teal'
  },
  'digital-marketing': {
    name: 'Digital Marketing',
    description: 'Comprehensive digital marketing insights covering strategy, implementation & optimization for maximum business growth and ROI.',
    keywords: 'digital marketing, marketing strategy, online marketing, marketing automation, UK digital marketing',
    color: 'orange'
  },
  'local-seo': {
    name: 'Local SEO',
    description: 'Local SEO strategies, Google Business Profile optimization & location-based marketing to dominate local search results.',
    keywords: 'local SEO, local search optimization, Google Business Profile, local rankings, Swansea local SEO, Wales SEO',
    color: 'emerald'
  },
  'content-strategy': {
    name: 'Content Strategy',
    description: 'Content marketing strategies, planning & optimization techniques to create engaging content that drives traffic and conversions.',
    keywords: 'content strategy, content marketing, content planning, content creation, editorial strategy, content optimization',
    color: 'pink'
  },
  'app-development': {
    name: 'App Development',
    description: 'Mobile app development, AI-powered applications & software development best practices for modern business success.',
    keywords: 'app development, mobile apps, software development, AI applications, custom apps',
    color: 'indigo'
  },
  'product-design': {
    name: 'Product Design',
    description: 'Product design insights, CAD engineering, 3D modeling & innovative development processes for manufacturing excellence.',
    keywords: 'product design, CAD design, 3D modeling, product development, engineering, manufacturing',
    color: 'red'
  }
};

// Helper functions

// Normalize category for case-insensitive matching
export function normalizeCategorySlug(category) {
  if (!category) return 'digital-marketing'; // Default fallback

  // Convert to lowercase and replace spaces with hyphens
  const normalized = category.toLowerCase().replace(/\s+/g, '-');

  // Check if normalized category exists in categoryInfo
  if (categoryInfo[normalized]) {
    return normalized;
  }

  // Fallback to digital-marketing if category not recognized
  return 'digital-marketing';
}

export function getPostsByCategory(categorySlug) {
  const normalizedSlug = normalizeCategorySlug(categorySlug);
  return blogPosts.filter(post => {
    const postCategory = normalizeCategorySlug(post.categorySlug || post.category);
    return postCategory === normalizedSlug;
  });
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
  // Get all unique category slugs from posts, normalized
  const categorySet = new Set();
  blogPosts.forEach(post => {
    const normalizedSlug = normalizeCategorySlug(post.categorySlug || post.category);
    categorySet.add(normalizedSlug);
  });

  const categories = Array.from(categorySet);

  return categories
    .map(slug => ({
      slug,
      name: categoryInfo[slug]?.name || 'Uncategorized',
      description: categoryInfo[slug]?.description || '',
      keywords: categoryInfo[slug]?.keywords || '',
      color: categoryInfo[slug]?.color || 'gray',
      count: getPostsByCategory(slug).length
    }))
    .filter(cat => cat.count > 0) // Only show categories with posts
    .sort((a, b) => b.count - a.count); // Sort by post count
}

// Instructions for adding new blog posts:
// 1. Add your new blog post object to the blogPosts array above
// 2. Make sure to include all required fields: title, slug, excerpt, category, categorySlug, image, alt, date, author, authorImage
// 3. Add appropriate tags for better organization
// 4. Set featured: true if you want it to appear in featured sections
// 5. The blog post will automatically appear on the main blog page and relevant category page 