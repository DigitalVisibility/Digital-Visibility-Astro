// RSS Feed for Digital Visibility Blog
export async function GET(context) {
  // Blog posts data (same as in blog index)
  const blogPosts = [
    {
      title: "Why UK Businesses Are Ditching Zapier for AI Conversation Automation",
      slug: "why-uk-businesses-ditching-zapier-ai-conversation-automation",
      excerpt: "Discover why forward-thinking UK businesses are moving beyond traditional workflow builders like Zapier to revolutionary AI conversation automation. Learn how talking to AI is replacing complex drag-and-drop workflows.",
      category: "AI Automation",
      categorySlug: "ai-automation",
      image: "https://imagedelivery.net/xUD9jGQuj6OKHFKJ8WGwXA/63f967f0-ffcd-4712-4019-1247367b3500/public",
      alt: "AI conversation automation interface showing natural language commands replacing complex workflow builders",
      date: "June 6, 2025",
      dateISO: "2025-06-06T00:00:00+00:00",
      author: "Darran Goulding",
      authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
      featured: true
    },
    {
      title: "10 Essential SEO Strategies for 2025",
      slug: "10-essential-seo-strategies-2025",
      excerpt: "Discover the most effective SEO tactics for 2025 to keep your website visible and attract more visitors. Learn practical implementation strategies for these modern SEO approaches.",
      category: "SEO",
      categorySlug: "seo",
      image: "https://huskycarecorner.com/autopilot/3/10-key-seo-strategies-for-2025-implementation-wct.jpg",
      alt: "Infographic showing 10 key SEO strategies for 2025 with implementation tips and visual elements representing different digital marketing concepts",
      date: "April 29, 2025",
      dateISO: "2025-04-29T00:00:00+00:00",
      author: "Darran Goulding",
      authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
      featured: true
    },
    {
      title: "How AI is Revolutionizing Website Design in 2025",
      slug: "how-ai-is-revolutionizing-website-design",
      excerpt: "Discover how artificial intelligence is transforming web design, making websites more personalized, accessible, and efficient. Learn about the latest AI tools and trends reshaping the digital landscape.",
      category: "Web Design",
      categorySlug: "web-design",
      image: "https://huskycarecorner.com/autopilot/3/how-ai-is-revolutionising-web-design-mmu.jpg",
      alt: "Designer working with AI tools to create responsive website layouts",
      date: "April 29, 2025",
      dateISO: "2025-04-29T00:00:00+00:00",
      author: "Darran Goulding",
      authorImage: "/Darran-Goulding-Royal-Academy-of-Engineering-Image.webp",
      featured: true
    }
  ];

  // Sort posts by date (newest first)
  const sortedPosts = blogPosts.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Digital Visibility Blog</title>
    <link>https://digitalvisibility.com/blog/</link>
    <description>Insights, tips, and strategies to enhance your digital presence and grow your business. Expert content on web design, SEO, and AI automation.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://digitalvisibility.com/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://digitalvisibility.com/Digital%20Visibility%20Logo.webp</url>
      <title>Digital Visibility Blog</title>
      <link>https://digitalvisibility.com/blog/</link>
    </image>
    <managingEditor>info@digitalvisibility.com (Darran Goulding)</managingEditor>
    <webMaster>info@digitalvisibility.com (Darran Goulding)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} Digital Visibility. All rights reserved.</copyright>
    <category>Technology</category>
    <category>Web Design</category>
    <category>SEO</category>
    <category>AI Automation</category>
    <ttl>60</ttl>
${sortedPosts.map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://digitalvisibility.com/blog/${post.slug}/</link>
      <description><![CDATA[${post.excerpt}]]></description>
      <author>info@digitalvisibility.com (${post.author})</author>
      <category><![CDATA[${post.category}]]></category>
      <pubDate>${new Date(post.dateISO).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://digitalvisibility.com/blog/${post.slug}/</guid>
      ${post.image ? `<enclosure url="${post.image}" type="image/jpeg"/>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
} 