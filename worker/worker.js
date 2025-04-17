/**
 * Cloudflare Worker for Website AI Optimization Scanner
 * This is a simplified version based on the original working analyzer
 */

// Schema quality evaluation is defined at the bottom of this file

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Handle OPTIONS requests for CORS
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Main entry point for the worker
 */
export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Parse URL and query parameters
    const url = new URL(request.url);
    const path = url.pathname;

    // For the /analyze endpoint
    if (path === '/analyze') {
      try {
        const targetUrl = url.searchParams.get('url');
        
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // Analyze the website
        const analysisResult = await analyzeWebsite(targetUrl);

        // Return the analysis result
        return new Response(JSON.stringify(analysisResult), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message || 'An error occurred during analysis' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Default response for other paths
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

/**
 * Main function to analyze a website
 * @param {string} url - The URL to analyze
 * @returns {Object} - The analysis result
 */
async function analyzeWebsite(url) {
  try {
    // Fetch the website content
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // AI Meta Tags Analysis (exactly as in original)
    const aiMetaTags = {
      purpose: !!findMeta(html, 'ai-purpose'),
      target: !!findMeta(html, 'ai-target'),
      keywords: !!findMeta(html, 'ai-keywords'),
      contentType: !!findMeta(html, 'ai-content-type'),
      businessType: !!findMeta(html, 'ai-business-type'),
      serviceArea: !!findMeta(html, 'ai-service-area')
    };

    // Schema Markup Analysis - Simplified but effective approach
    const schemaMarkup = html.includes('application/ld+json') || 
                        html.includes('itemtype="http://schema.org') || 
                        html.includes('itemtype="https://schema.org');
    
    // Evaluate Schema Quality (completely separate from schema detection)
    // More robust implementation to detect various schema formats
    let schemaQualityScore = 0;
    
    try {
      // First check if there's any schema markup at all
      const hasSchema = html.includes('application/ld+json') || 
                       html.includes('itemtype="http://schema.org') || 
                       html.includes('itemtype="https://schema.org') ||
                       html.includes('itemtype=\'http://schema.org') ||
                       html.includes('itemtype=\'https://schema.org');
      
      if (hasSchema) {
        // Extract all schema scripts for more reliable checking
        const schemaScripts = findAllSchemaMarkup(html);
        
        // Initialize schema type detection variables
        let hasOrganization = false;
        let hasLocalBusiness = false;
        let hasProduct = false;
        let hasService = false;
        let hasArticle = false;
        let hasBreadcrumb = false;
        
        // Check plain HTML for common schema patterns (as fallback)
        const lowerHtml = html.toLowerCase();
        if (lowerHtml.includes('"@type"') || lowerHtml.includes('"@type":') || 
            lowerHtml.includes('\'@type\'') || lowerHtml.includes('\'@type\':')) {
          
          // Check for organization schema in various formats
          hasOrganization = lowerHtml.includes('organization') && 
                           (lowerHtml.includes('@type') || lowerHtml.includes('itemtype'));
          
          // Check for local business schema in various formats
          hasLocalBusiness = (lowerHtml.includes('localbusiness') || 
                            (lowerHtml.includes('business') && lowerHtml.includes('local'))) && 
                            (lowerHtml.includes('@type') || lowerHtml.includes('itemtype'));
          
          // Check for product schema
          hasProduct = lowerHtml.includes('product') && 
                      (lowerHtml.includes('@type') || lowerHtml.includes('itemtype'));
          
          // Check for service schema
          hasService = lowerHtml.includes('service') && 
                      (lowerHtml.includes('@type') || lowerHtml.includes('itemtype'));
          
          // Check for article or blog schema
          hasArticle = (lowerHtml.includes('article') || lowerHtml.includes('blogposting')) && 
                      (lowerHtml.includes('@type') || lowerHtml.includes('itemtype'));
          
          // Check for breadcrumb schema
          hasBreadcrumb = (lowerHtml.includes('breadcrumb') || lowerHtml.includes('breadcrumblist')) && 
                         (lowerHtml.includes('@type') || lowerHtml.includes('itemtype'));
        }
        
        // Process JSON-LD schema scripts for more accurate detection
        for (const script of schemaScripts) {
          try {
            const data = JSON.parse(script);
            const items = Array.isArray(data) ? data : [data];
            
            for (const item of items) {
              if (!item['@type']) continue;
              
              const type = item['@type'].toLowerCase();
              
              if (type.includes('organization')) hasOrganization = true;
              if (type.includes('business')) hasLocalBusiness = true;
              if (type.includes('product')) hasProduct = true;
              if (type.includes('service')) hasService = true;
              if (type.includes('article') || type.includes('blog')) hasArticle = true;
              if (type.includes('breadcrumb')) hasBreadcrumb = true;
            }
          } catch (e) {
            // Skip error in JSON parsing - continue checking other scripts
            console.log('Error parsing schema JSON:', e);
          }
        }
        
        // Calculate score based on presence of important schema types
        let score = 0;
        if (hasOrganization) score += 25;
        if (hasLocalBusiness) score += 20;
        if (hasProduct || hasService) score += 20;
        if (hasArticle) score += 20;
        if (hasBreadcrumb) score += 15;
        
        schemaQualityScore = score;
      }
    } catch (error) {
      console.log('Error in schema quality evaluation:', error);
      schemaQualityScore = 0; // Default to zero if there's an error
    }
    
    // Check for specific schema types using reliable string matching
    const organizationSchema = html.includes('"@type":"Organization"') || 
                             html.includes('"@type": "Organization"') ||
                             html.includes('"publisher"') || // Common parent for Organization
                             html.includes('itemtype="http://schema.org/Organization"') || 
                             html.includes('itemtype="https://schema.org/Organization"');
                             
    const productSchema = html.includes('"@type":"Product"') || 
                         html.includes('"@type": "Product"') ||
                         html.includes('itemtype="http://schema.org/Product"') || 
                         html.includes('itemtype="https://schema.org/Product"');
                         
    const serviceSchema = html.includes('"@type":"Service"') || 
                         html.includes('"@type": "Service"') ||
                         html.includes('itemtype="http://schema.org/Service"') || 
                         html.includes('itemtype="https://schema.org/Service"');
                         
    const articleSchema = html.includes('"@type":"Article"') || 
                         html.includes('"@type": "Article"') ||
                         html.includes('"@type":"BlogPosting"') ||
                         html.includes('itemtype="http://schema.org/Article"') || 
                         html.includes('itemtype="https://schema.org/Article"');
                         
    const faqSchema = html.includes('"@type":"FAQPage"') || 
                     html.includes('"@type": "FAQPage"') ||
                     html.includes('itemtype="http://schema.org/FAQPage"') || 
                     html.includes('itemtype="https://schema.org/FAQPage"');
                     
    const howtoSchema = html.includes('"@type":"HowTo"') || 
                       html.includes('"@type": "HowTo"') ||
                       html.includes('itemtype="http://schema.org/HowTo"') || 
                       html.includes('itemtype="https://schema.org/HowTo"');

    // Manual check for Organization in JSON-LD
    function checkForOrganizationInJsonLd(html) {
      // Quick guard
      if (!html.includes('application/ld+json') || !html.includes('@type')) {
        return false;
      }
    
      try {
        // Try to find all JSON-LD scripts and analyze them
        const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        
        while ((match = jsonLdRegex.exec(html)) !== null) {
          const jsonText = match[1].trim();
          console.log("Found JSON-LD:", jsonText.substring(0, 100)); // Log first 100 chars
          
          try {
            const jsonData = JSON.parse(jsonText);
            
            // Check for direct Organization type
            if (jsonData["@type"] === "Organization") {
              console.log("Found direct Organization schema");
              return true;
            }
            
            // Check for Organization as publisher
            if (jsonData.publisher && typeof jsonData.publisher === 'object') {
              if (jsonData.publisher["@type"] === "Organization") {
                console.log("Found Organization as publisher");
                return true;
              }
            }
            
            // Check for WebSite type that often has Organization as publisher
            if (jsonData["@type"] === "WebSite" && jsonData.publisher) {
              console.log("Found WebSite with publisher");
              return true;
            }
          } catch (e) {
            // Invalid JSON, continue with next match
            console.log("Error parsing JSON-LD:", e);
          }
        }
      } catch (e) {
        console.log("Error checking for Organization:", e);
      }
      
      // Direct string check as fallback
      return html.includes('"publisher":') && html.includes('"@type":"Organization"');
    }

    // Check for the AI Optimized site pattern specifically
    const aiOptimizedOrganizationPattern = html.includes('"@type":"WebSite"') && 
                                         html.includes('"publisher"') && 
                                         html.includes('"@type":"Organization"');
                                         
    // Use this pattern check to override the previous checks
    const organizationSchemaJsonLd = checkForOrganizationInJsonLd(html) || aiOptimizedOrganizationPattern;

    // AI Files Analysis
    const aiOptimizedFile = !!findAll(html, 'link[rel="ai-optimization"]').length;
    const llmFile = !!findAll(html, 'link[rel="llm"]').length;

    // Performance Analysis
    const preloadLinks = findAll(html, 'link[rel="preload"]').length > 0;
    const preconnectLinks = findAll(html, 'link[rel="preconnect"]').length > 0;
    const deferScripts = findAll(html, 'script[defer]').length > 0;
    const lazyLoadElements = findAll(html, '[loading="lazy"]').length > 0;

    // Author Attribution Analysis
    let authorBio = false;
    let authorLinks = false;

    if (schemaMarkup) {
      const schemaScripts = findAllSchemaMarkup(html);
      for (const scriptContent of schemaScripts) {
        try {
          // Parse the schema content
          let schema = scriptContent;
          if (typeof scriptContent === 'string') {
            schema = JSON.parse(scriptContent);
          }
          
          // Check for author info
          if (schema) {
            if (schema.author || schema.creator || schema.founder) {
              authorBio = true;
            }
            
            if (schema.sameAs || (schema.author && schema.author.sameAs)) {
              authorLinks = true;
            }
            
            if (authorBio && authorLinks) break;
          }
        } catch (e) {
          console.log("Error parsing schema:", e);
          // Continue with next script if parsing fails
        }
      }
    }

    // Image Optimization Analysis
    const images = findAll(html, 'img');
    const totalImages = images.length;
    const modernFormatImages = html.match(/\.(webp|avif)/gi) || [];
    const modernImageFormats = modernFormatImages.length > 0;
    
    let imagesWithAlt = 0;
    let descriptiveAltText = false;
    
    if (totalImages > 0) {
      // Check for alt text in images
      images.forEach(img => {
        const altAttr = img.match(/alt=["']([^"']*)["']/i);
        if (altAttr && altAttr[1] && altAttr[1].trim().length > 5) {
          imagesWithAlt++;
        }
      });
      
      // Calculate percentage of images with good alt text
      const altTextPercentage = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 0;
      descriptiveAltText = altTextPercentage >= 50; // At least 50% of images have good alt text
    }
    
    // Calculate image optimization score
    const imageOptimizationScore = [
      modernImageFormats,
      descriptiveAltText
    ].filter(Boolean).length / 2 * 100;

    // Content Freshness Analysis - Updated Scoring Model
    const currentDate = new Date();
    
    // Check for published/created date (15 points)
    const publishedDateMeta = findMeta(html, 'article:published_time') || 
                            findMeta(html, 'pubdate') || 
                            findMeta(html, 'date');
    
    const hasPublishedDate = !!publishedDateMeta || html.includes('datePublished');
    
    // Check for modified/reviewed date (15 points)
    const modifiedDateMeta = findMeta(html, 'article:modified_time');
    const reviewedDateElement = html.includes('reviewedDate') || html.includes('dateReviewed');
    
    const hasModifiedOrReviewedDate = !!modifiedDateMeta || html.includes('dateModified') || reviewedDateElement;
    
    // Calculate Date Presence score (30 points)
    const datePresenceScore = (hasPublishedDate ? 15 : 0) + (hasModifiedOrReviewedDate ? 15 : 0);
    
    // Extract the most recent date for recency calculation
    let contentDate = null;
    let recencyScore = 0;
    
    // Try to find an actual date
    if (modifiedDateMeta) {
      contentDate = new Date(modifiedDateMeta);
    } else if (publishedDateMeta) {
      contentDate = new Date(publishedDateMeta);
    }
    
    // If we couldn't extract a specific date, check for year mentions
    if (!contentDate || isNaN(contentDate.getTime())) {
      const currentYear = currentDate.getFullYear();
      const lastYear = currentYear - 1;
      
      if (html.includes(currentYear.toString())) {
        // Current year mentioned - assume content is at most 6 months old
        recencyScore = 60;
      } else if (html.includes(lastYear.toString())) {
        // Last year mentioned - assume content is 1-2 years old
        recencyScore = 35;
      } else {
        // No recent year mentioned - assume older content
        recencyScore = 0;
      }
    } else {
      // Calculate age in months
      const ageInMonths = (currentDate.getTime() - contentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      // Assign recency score based on age
      if (ageInMonths < 3) {
        recencyScore = 70;
      } else if (ageInMonths < 6) {
        recencyScore = 60;
      } else if (ageInMonths < 12) {
        recencyScore = 50;
      } else if (ageInMonths < 24) {
        recencyScore = 35;
      } else if (ageInMonths < 36) {
        recencyScore = 20;
      } else if (ageInMonths < 60) {
        recencyScore = 10;
      } else {
        recencyScore = 0;
      }
    }
    
    // Calculate total content freshness score (out of 100)
    const contentFreshnessScore = datePresenceScore + recencyScore;
    
    // Set individual components for display
    const publishedDate = hasPublishedDate;
    const modifiedDate = hasModifiedOrReviewedDate;
    
    // Determine content age category for display
    let contentAge = "Unknown";
    if (recencyScore === 70) contentAge = "Less than 3 months";
    else if (recencyScore === 60) contentAge = "3-6 months";
    else if (recencyScore === 50) contentAge = "6-12 months";
    else if (recencyScore === 35) contentAge = "1-2 years";
    else if (recencyScore === 20) contentAge = "2-3 years";
    else if (recencyScore === 10) contentAge = "3-5 years";
    else if (recencyScore === 0) contentAge = "Over 5 years or unknown";
    
    // Citations & References Analysis - Improved Implementation
    // Extract the hostname of the URL being scanned
    let currentHostname = '';
    try {
      const urlObj = new URL(url);
      currentHostname = urlObj.hostname;
    } catch (e) {
      console.error('Error parsing URL:', e);
    }

    // Log for debugging
    console.log('Current hostname:', currentHostname);
    
    // Extract the body content to focus our search
    let bodyContent = html;
    const bodyMatch = /<body[^>]*>(([\s\S](?!<\/body>))*[\s\S])<\/body>/i.exec(html);
    if (bodyMatch && bodyMatch[1]) {
      bodyContent = bodyMatch[1];
      console.log('Successfully extracted body content');
    } else {
      console.log('Could not extract body content, using full HTML');
    }

    // Check for citation elements more thoroughly
    const citationElements = 
      // HTML tags
      bodyContent.match(/<blockquote[^>]*>/i) !== null ||
      bodyContent.match(/<cite[^>]*>/i) !== null ||
      bodyContent.match(/<q[^>]*>/i) !== null ||
      // CSS classes for citations
      bodyContent.match(/class=["'][^"']*citation[^"']*["']/i) !== null ||
      bodyContent.match(/class=["'][^"']*reference[^"']*["']/i) !== null ||
      bodyContent.match(/class=["'][^"']*footnote[^"']*["']/i) !== null ||
      bodyContent.match(/class=["'][^"']*endnote[^"']*["']/i) !== null;
    
    console.log('Citation elements found:', citationElements);
    
    // Check for external links (links to different domains)
    let hasReferenceLinks = false;
    const externalLinks = [];
    
    // Extract all href attributes with a more robust regex
    const hrefRegex = /href=["']((https?|ftp):\/\/[^"'\s]+)["']/gi;
    let match;
    let linkCount = 0;
    
    // Domains to exclude from citation link detection
    const excludedDomains = [
      // Social media platforms
      'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com',
      'tiktok.com', 'pinterest.com', 'threads.net', 'snapchat.com', 'reddit.com',
      'tumblr.com', 'medium.com', 'quora.com',
      
      // Business profiles and maps
      'google.com/business', 'business.google.com', 'maps.google.com',
      'yelp.com', 'bbb.org', 'trustpilot.com', 'glassdoor.com', 'tripadvisor.com',
      'foursquare.com',
      
      // Web hosting & website builders
      'wix.com', 'wordpress.com', 'squarespace.com', 'shopify.com', 'webflow.com',
      'godaddy.com', 'hostgator.com', 'bluehost.com', 'netlify.com', 'vercel.app',
      'herokuapp.com', 'cloudflare.com', 'github.io',
      
      // CDNs & Common Dependencies
      'googleapis.com', 'gstatic.com', 'jquery.com', 'jsdelivr.net', 'cloudfront.net',
      'bootstrapcdn.com', 'fontawesome.com', 'fonts.google.com', 'typekit.net',
      'gravatar.com', 'cdnjs.cloudflare.com',
      
      // Analytics & Tracking
      'googletagmanager.com', 'google-analytics.com', 'doubleclick.net',
      'facebook.net', 'hotjar.com', 'clarity.ms',
      
      // Payment services
      'paypal.com', 'stripe.com', 'authorize.net', 'square.com', 'checkout.com'
    ];
    
    // Check if a URL should be excluded based on URL patterns
    const shouldExcludeUrl = (url) => {
      // Exclude common non-citation URL patterns
      return url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)($|\?)/i) !== null || // Common resource files
             url.includes('/wp-content/') || // WordPress resources
             url.includes('/wp-includes/') || // WordPress resources
             url.includes('/assets/') || // Common resource paths
             url.includes('/images/') || // Image directories
             url.includes('/img/') || // Image directories
             url.includes('/css/') || // CSS directories
             url.includes('/js/') || // JavaScript directories
             url.includes('/cdn/') || // CDN paths
             url.includes('/static/') || // Static resources
             url.includes('/api/') || // API endpoints
             url.includes('/rss') || // RSS feeds
             url.includes('/feed') || // Feeds
             url.includes('/sitemap') || // Sitemaps
             url.includes('/logo') || // Logos
             url.includes('/icon') || // Icons
             url.includes('utm_') || // UTM tracking parameters
             url.includes('pixel.'); // Tracking pixels
    };
    
    // Check if a URL is likely in header/footer (simplified heuristic)
    const isLikelyInHeaderFooter = (context) => {
      const lowerContext = context.toLowerCase();
      return lowerContext.includes('header') || 
             lowerContext.includes('footer') || 
             lowerContext.includes('navbar') || 
             lowerContext.includes('nav-item') ||
             lowerContext.includes('social-') || 
             lowerContext.includes('social_') ||
             lowerContext.includes('social-media') ||
             lowerContext.includes('follow-us');
    };
    
    while ((match = hrefRegex.exec(bodyContent)) !== null) {
      linkCount++;
      try {
        const linkUrl = match[1];
        const linkHostname = new URL(linkUrl).hostname;
        
        // Get context around the link (up to 100 chars before and after)
        const linkIndex = match.index;
        const contextStart = Math.max(0, linkIndex - 100);
        const contextEnd = Math.min(bodyContent.length, linkIndex + 100);
        const context = bodyContent.substring(contextStart, contextEnd);
        
        // Debug
        console.log(`Found link #${linkCount}:`, linkUrl, 'hostname:', linkHostname);
        
        // Check if the link points to a different domain and is not excluded
        const isDifferentDomain = linkHostname && linkHostname !== currentHostname && linkHostname !== '';
        const isExcludedDomain = excludedDomains.some(domain => linkHostname.includes(domain));
        const isExcludedUrlPattern = shouldExcludeUrl(linkUrl);
        const isInHeaderFooter = isLikelyInHeaderFooter(context);
        
        if (isDifferentDomain && 
            !isExcludedDomain && 
            !isExcludedUrlPattern &&
            !isInHeaderFooter &&
            !linkUrl.includes('javascript:') && // Skip JavaScript pseudo-URLs
            !linkUrl.includes('mailto:') && // Skip mailto links
            !linkUrl.includes('tel:')) { // Skip telephone links
          
          externalLinks.push(linkUrl);
          hasReferenceLinks = true;
          console.log('Valid external reference link found:', linkUrl);
        }
      } catch (e) {
        console.error('Error parsing URL:', match[1], e);
        // Skip invalid URLs
        continue;
      }
    }
    
    console.log('Total links found:', linkCount);
    console.log('External links found:', externalLinks.length);
    console.log('Has reference links:', hasReferenceLinks);
    
    // Calculate citations score - 50% for citations, 50% for external links
    const citationsScore = (citationElements ? 50 : 0) + (hasReferenceLinks ? 50 : 0);
    console.log('Citations score:', citationsScore);
    
    // Authority & Trust Signals Analysis
    // Check for author information
    const authorInfo = !!findMeta(html, 'author') || 
                     html.includes('author') || 
                     html.includes('byline');
    
    // Redefine the authorBio check to avoid conflicts
    const hasAuthorBio = html.includes('bio') || 
                       html.includes('about-author') || 
                       html.includes('about-me') ||
                       html.includes('profile');
    
    // Check for social media links
    const socialMediaLinks = 
      html.includes('twitter.com') || 
      html.includes('instagram.com') || 
      html.includes('youtube.com') ||
      html.includes('threads.net') ||
      html.includes('tiktok.com');
    
    // Check for business profile links
    const businessProfileLinks = 
      html.includes('google.com/business') || 
	  html.includes('linkedin.com') || 
	  html.includes('facebook.com') || 
      html.includes('yelp.com') || 
      html.includes('bbb.org') || 
      html.includes('trustpilot.com') || 
      html.includes('glassdoor.com') ||
      html.includes('tripadvisor');
    
    // Check for author meta tag
    const authorMetaTag = !!findMeta(html, 'author');
    
    // Check for author in schema
    const authorInSchema = (html.includes('"author"') || html.includes('"author":')) && 
                         (html.includes('Person') || html.includes('Organization'));
    
    // Calculate authority score
    const authorityScore = [
      authorInfo,
      hasAuthorBio,
      socialMediaLinks,
      businessProfileLinks,
      authorMetaTag,
      authorInSchema
    ].filter(Boolean).length / 6 * 100;

    // Calculate AI SEO Score with new weighting:
    // - Schema: 50%
    // - AI Optimized/LLM Files: 25% total (12.5% each) 
    // - AI Meta Tags: 25% (5% per tag, max 25%)
    const metaTagCount = Object.values(aiMetaTags).filter(Boolean).length;
    const metaTagScore = Math.min(metaTagCount * 5, 25); // 5% per tag, max 25%
    
    const aiSeoScore = (
      (schemaMarkup ? 50 : 0) + 
      (aiOptimizedFile ? 12.5 : 0) + 
      (llmFile ? 12.5 : 0) +
      metaTagScore
    );

    // Calculate overall AI readiness score
    // 50% for schema, 25% for AI-optimized.txt, 25% for llm.txt
    const aiReadinessScore = (
      (schemaMarkup ? 50 : 0) + 
      (aiOptimizedFile ? 25 : 0) + 
      (llmFile ? 25 : 0)
    );
    
    // Combine AI-optimized and LLM files into one indicator
    const hasAiFiles = aiOptimizedFile || llmFile;

    // Calculate scores
    const aiMetaScore = Object.values(aiMetaTags).filter(Boolean).length / 6 * 100;
    const performanceScore = [
      preloadLinks,
      preconnectLinks,
      deferScripts,
      lazyLoadElements
    ].filter(Boolean).length / 4 * 100;
    
    const aiOptimizationScore = [
      schemaMarkup,
      hasAiFiles,
      Object.values(aiMetaTags).some(Boolean)
    ].filter(Boolean).length / 3 * 100;
    
    // Calculate overall score - weighted average
    const overallScore = (
      aiMetaScore * 0.4 + 
      performanceScore * 0.3 + 
      aiOptimizationScore * 0.3
    );

    return {
      overallScore,
      aiMetaScore,
      performanceScore,
      aiOptimizationScore,
      schemaMarkup,
      schemaQuality: schemaQualityScore,
      organizationSchema,
      organizationSchemaJsonLd,
      productSchema,
      serviceSchema,
      articleSchema,
      faqSchema,
      howtoSchema,
      aiOptimizedFile,
      llmFile,
      hasAuthorBio,
      authorLinks,
      aiMetaTags,
      preloadLinks,
      preconnectLinks,
      deferScripts,
      lazyLoadElements,
      imageOptimizationScore,
      modernImageFormats,
      descriptiveAltText,
      totalImages,
      imagesWithAlt,
      contentFreshnessScore,
      publishedDate,
      modifiedDate,
      contentAge,
      citationsScore,
      citationElements,
      hasReferenceLinks,
      authorityScore,
      authorInfo,
      socialMediaLinks,
      businessProfileLinks,
      authorMetaTag,
      authorInSchema,
      aiReadinessScore,
      hasAiFiles,
      aiSeoScore
    };
  } catch (error) {
    console.error('Error analyzing website:', error);
    throw error;
  }
}

/**
 * Helper function to find meta tags
 * @param {string} html - The HTML content
 * @param {string} name - The meta tag name to search for
 * @returns {string|null} - The meta tag content
 */
function findMeta(html, name) {
  const regex = new RegExp(`<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

/**
 * Helper function to find elements by selector
 * @param {string} html - The HTML content
 * @param {string} selector - The CSS-like selector
 * @returns {Array} - The matching elements
 */
function findAll(html, selector) {
  // This is a simplified implementation to mimic browser DOM querying
  const results = [];
  
  // Handle different selector types
  if (selector.includes('[')) {
    // Attribute selector
    const [tag, attrPart] = selector.split('[');
    const attr = attrPart.replace(']', '');
    
    if (attr.includes('=')) {
      // Attribute with specific value
      const [attrName, attrValue] = attr.split('=');
      const cleanValue = attrValue.replace(/["']/g, '');
      const regex = new RegExp(`<${tag}[^>]*${attrName}\\s*=\\s*['"]${cleanValue}['"][^>]*>`, 'gi');
      let match;
      while ((match = regex.exec(html)) !== null) {
        results.push(match[0]);
      }
    } else {
      // Attribute presence
      const regex = new RegExp(`<${tag}[^>]*${attr}[^>]*>`, 'gi');
      let match;
      while ((match = regex.exec(html)) !== null) {
        results.push(match[0]);
      }
    }
  } else {
    // Simple tag selector
    const regex = new RegExp(`<${selector}[^>]*>`, 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push(match[0]);
    }
  }
  
  return results;
}

/**
 * Find all schema markup in the HTML
 * @param {string} html - The HTML content
 * @returns {Array} - The schema scripts
 */
function findAllSchemaMarkup(html) {
  const results = [];
  
  // Method 1: Find script tags with type="application/ld+json"
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const content = match[1].trim();
      if (content) {
        results.push(content);
      }
    } catch (e) {
      console.log("Error processing JSON-LD:", e);
    }
  }
  
  // Method 2: Check for microdata with itemscope
  const hasItemScope = /<[^>]+itemscope[^>]*>/i.test(html);
  if (hasItemScope) {
    // Direct checking for specific types
    if (html.includes('itemtype="http://schema.org/Organization"') || 
        html.includes('itemtype="https://schema.org/Organization"')) {
      results.push(JSON.stringify({"@type": "Organization"}));
    }
    
    if (html.includes('itemtype="http://schema.org/Service"') || 
        html.includes('itemtype="https://schema.org/Service"')) {
      results.push(JSON.stringify({"@type": "Service"}));
    }
    
    if (html.includes('itemtype="http://schema.org/Product"') || 
        html.includes('itemtype="https://schema.org/Product"')) {
      results.push(JSON.stringify({"@type": "Product"}));
    }
    
    if (html.includes('itemtype="http://schema.org/Article"') || 
        html.includes('itemtype="https://schema.org/Article"')) {
      results.push(JSON.stringify({"@type": "Article"}));
    }
  }
  
  return results;
}
