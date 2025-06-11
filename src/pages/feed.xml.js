import fs from 'fs';
import path from 'path';

// Dynamic RSS Feed for Digital Visibility Blog
export async function GET(context) {
  try {
    // Get the blog directory path
    const blogDir = path.join(process.cwd(), 'src', 'pages', 'blog');
    
    // Read all files in the blog directory
    const files = fs.readdirSync(blogDir);
    
    // Filter for .astro files (exclude index.astro)
    const blogFiles = files.filter(file => 
      file.endsWith('.astro') && file !== 'index.astro'
    );
    
    const blogPosts = [];
    
    // Process each blog file
    for (const file of blogFiles) {
      try {
        const filePath = path.join(blogDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract the slug from filename
        const slug = file.replace('.astro', '');
        
        // Extract metadata from the file content
        const post = extractBlogMetadata(content, slug);
        if (post) {
          blogPosts.push(post);
        }
      } catch (error) {
        console.error(`Error processing blog file ${file}:`, error);
      }
    }
    
    // Sort posts by date (newest first)
    const sortedPosts = blogPosts.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
    
    // Generate RSS XML
    const rssXml = generateRSSXML(sortedPosts);
    
    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
      },
    });
    
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    
    // Fallback to static data if dynamic fails
    return getFallbackRSS();
  }
}

function extractBlogMetadata(content, slug) {
  try {
    // Extract title from the content (look for h1 or title in various formats)
    let title = '';
    
    // Try to find title in various formats
    const titlePatterns = [
      /<h1[^>]*>(.*?)<\/h1>/i,
      /<title>(.*?)<\/title>/i,
      /title:\s*["'](.*?)["']/i,
      /# (.*)/m
    ];
    
    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match) {
        title = match[1].trim();
        break;
      }
    }
    
    // If no title found, create from slug
    if (!title) {
      title = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    
    // Extract description/excerpt
    let description = '';
    const descPatterns = [
      /<meta name="description" content="(.*?)"/i,
      /<p[^>]*>(.*?)<\/p>/i
    ];
    
    for (const pattern of descPatterns) {
      const match = content.match(pattern);
      if (match) {
        description = match[1].trim();
        break;
      }
    }
    
    // Determine category based on content or filename
    let category = 'General';
    if (slug.includes('seo') || content.toLowerCase().includes('seo')) {
      category = 'SEO';
    } else if (slug.includes('ai') || content.toLowerCase().includes('artificial intelligence')) {
      category = 'AI Automation';
    } else if (slug.includes('design') || content.toLowerCase().includes('web design')) {
      category = 'Web Design';
    }
    
    // Estimate date (you might want to add actual date metadata to your blog posts)
    const dateISO = getPostDate(slug, content);
    
    // Find featured image
    let image = '';
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch) {
      image = imgMatch[1];
    }
    
    return {
      title: cleanText(title),
      slug,
      excerpt: cleanText(description) || `Read about ${title.toLowerCase()} and discover insights for your business.`,
      category,
      image: image || 'https://digitalvisibility.com/Digital%20Visibility%20Logo.webp',
      dateISO,
      author: 'Darran Goulding'
    };
    
  } catch (error) {
    console.error(`Error extracting metadata for ${slug}:`, error);
    return null;
  }
}

function getPostDate(slug, content) {
  // Try to extract date from content
  const datePatterns = [
    /datePublished['"]:?\s*['"]([^'"]+)['"]/i,
    /date['"]:?\s*['"]([^'"]+)['"]/i,
    /(\d{4}-\d{2}-\d{2})/
  ];
  
  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match) {
      return new Date(match[1]).toISOString();
    }
  }
  
  // Fallback: estimate based on known posts or use current date
  const knownDates = {
    'why-uk-businesses-ditching-zapier-ai-conversation-automation': '2025-06-06T00:00:00+00:00',
    '10-essential-seo-strategies-2025': '2025-04-29T00:00:00+00:00',
    'how-ai-is-revolutionizing-website-design': '2025-04-29T00:00:00+00:00'
  };
  
  return knownDates[slug] || new Date().toISOString();
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .trim();
}

function generateRSSXML(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
    <ttl>30</ttl>
${posts.map(post => `    <item>
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
}

function getFallbackRSS() {
  // Fallback static data in case dynamic generation fails
  const fallbackPosts = [
    {
      title: "Why UK Businesses Are Ditching Zapier for AI Conversation Automation",
      slug: "why-uk-businesses-ditching-zapier-ai-conversation-automation",
      excerpt: "Discover why forward-thinking UK businesses are moving beyond traditional workflow builders like Zapier to revolutionary AI conversation automation.",
      category: "AI Automation",
      image: "https://imagedelivery.net/xUD9jGQuj6OKHFKJ8WGwXA/63f967f0-ffcd-4712-4019-1247367b3500/public",
      dateISO: "2025-06-06T00:00:00+00:00",
      author: "Darran Goulding"
    },
    {
      title: "10 Essential SEO Strategies for 2025",
      slug: "10-essential-seo-strategies-2025",
      excerpt: "Discover the most effective SEO tactics for 2025 to keep your website visible and attract more visitors.",
      category: "SEO",
      image: "https://huskycarecorner.com/autopilot/3/10-key-seo-strategies-for-2025-implementation-wct.jpg",
      dateISO: "2025-04-29T00:00:00+00:00",
      author: "Darran Goulding"
    },
    {
      title: "How AI is Revolutionizing Website Design in 2025",
      slug: "how-ai-is-revolutionizing-website-design",
      excerpt: "Discover how artificial intelligence is transforming web design, making websites more personalized, accessible, and efficient.",
      category: "Web Design",
      image: "https://huskycarecorner.com/autopilot/3/how-ai-is-revolutionising-web-design-mmu.jpg",
      dateISO: "2025-04-29T00:00:00+00:00",
      author: "Darran Goulding"
    }
  ];
  
  const rssXml = generateRSSXML(fallbackPosts);
  
  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
} 