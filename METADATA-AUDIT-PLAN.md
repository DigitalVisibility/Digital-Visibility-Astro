# Metadata Audit & Enhancement Plan
**Date:** 2025-10-13
**Goal:** Ensure all pages have comprehensive, unique, SEO/AEO-optimized metadata following best practices

---

## ✅ Reference Pages (Complete Metadata)
1. **Homepage** (`index.astro`) - ⭐ Gold Standard
2. **App Development** (`app-development.astro`) - ⭐ Gold Standard  
3. **Product Design** (`product-design.astro`) - Complete

---

## 📋 Required Metadata Components

### **Tier 1: Essential SEO (ALL PAGES MUST HAVE)**
- ✅ `<title>` - Unique, keyword-rich
- ✅ `meta name="description"` - 150-160 chars, unique, compelling
- ✅ `meta name="keywords"` - Relevant, unique per page
- ✅ `link rel="canonical"` - Prevent duplicate content
- ✅ `meta name="robots"` - Index/follow directives
- ✅ `meta name="googlebot"` - Google-specific directives
- ✅ `meta name="bingbot"` - Bing-specific directives

### **Tier 2: Social & Rich Previews (ALL PAGES MUST HAVE)**
- ✅ OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:url`, etc.)
- ✅ Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- ✅ `meta name="publisher"` - Digital Visibility Limited
- ✅ `meta name="author"` - Darran Goulding

### **Tier 3: Geographic (Location Pages MUST HAVE)**
- ✅ `meta name="geo.region"` - GB-SWA, GB-WLS, etc.
- ✅ `meta name="geo.placename"` - Swansea, Cardiff, etc.
- ✅ `meta name="geo.position"` - Lat/Long
- ✅ `meta name="ICBM"` - Coordinates

### **Tier 4: AI Optimization (ALL SERVICE PAGES SHOULD HAVE)**
- ✅ `meta name="ai-generated"` - Always "false"
- ✅ `meta name="ai-purpose"` - What the page is for
- ✅ `meta name="ai-target"` - Target audience
- ✅ `meta name="ai-keywords"` - AI-specific keywords
- ✅ `meta name="ai-content-type"` - Page classification
- ✅ `meta name="ai-business-type"` - Business classification
- ✅ `meta name="ai-service-area"` - Geographic reach
- ✅ `meta name="ai-language"` - en-GB
- ✅ `meta name="ai-context"` - Page context
- ✅ `meta name="ai-industry"` - Industry classification
- ✅ `meta name="ai-services"` - Detailed service list
- ✅ `meta name="ai-audience"` - Detailed audience
- ✅ `meta name="ai-intent"` - User search intent
- ✅ `meta name="ai-unique-value"` - USPs (⚠️ AVOID Royal Academy here unless essential)

### **Tier 5: Trust Signals (Homepage & About ONLY)**
- ⚠️ `meta name="business-awards"` - Royal Academy Award (Homepage/About/Darran's page ONLY)
- ✅ `meta name="business-certifications"` - Certifications
- ✅ `meta name="business-founding-date"` - 2023-01-01

---

## 🚫 DUPLICATE CONTENT RISKS - AVOID

### **❌ DO NOT Duplicate:**
1. **Royal Academy Award**
   - ✅ ONLY on: Homepage, About, Darran Goulding's page
   - ❌ REMOVE from: `ai-unique-value` on product-design.astro and app-development.astro
   - ✅ Alternative: "Award-winning founder" or "Experienced team"

2. **Identical AI Metadata**
   - Each page's `ai-purpose`, `ai-keywords`, `ai-services` must be UNIQUE
   - Tailor to specific service/location
   - Don't copy-paste between pages

3. **Boilerplate Descriptions**
   - Every `meta name="description"` must be unique
   - Every `og:description` must be unique
   - Every `ai-unique-value` must be unique

---

## 📊 Current Status by Page Category

### **Service Pages (Core Services)**
| Page | Metadata Status | Action Needed |
|------|----------------|---------------|
| `answer-engine-optimization.astro` | Partial AI tags | Add complete AI metadata |
| `generative-engine-optimization.astro` | Unknown | Audit & enhance |
| `search-brand-optimization.astro` | Unknown | Audit & enhance |
| `search-engine-optimization.astro` | Unknown | Audit & enhance |
| `supercharged-engine-optimization.astro` | Unknown | Audit & enhance |
| `digital-marketing.astro` | Unknown | Audit & enhance |
| `ai-workflow-automation.astro` | Unknown | Audit & enhance |
| `ai-conversation-automation.astro` | Unknown | Audit & enhance |
| ✅ `app-development.astro` | Complete | Remove Royal Academy from ai-unique-value |
| ✅ `product-design.astro` | Complete | Remove Royal Academy from ai-unique-value |

### **Location SEO Pages**
| Page | Metadata Status | Action Needed |
|------|----------------|---------------|
| `seo-swansea.astro` | Minimal | Add complete metadata |
| `seo-cardiff.astro` | Minimal (no AI tags) | Add complete metadata |
| `seo-carmarthen.astro` | Unknown | Audit & enhance |
| `seo-newport.astro` | Unknown | Audit & enhance |
| `seo-birmingham.astro` | Unknown | Audit & enhance |
| `seo-wrexham.astro` | Unknown | Audit & enhance |
| `seo/index.astro` | Unknown | Audit & enhance |
| `seo-uk/index.astro` | Unknown | Audit & enhance |
| `seo-wales/index.astro` | Unknown | Audit & enhance |

---

## 🎯 Implementation Strategy

### **Phase 1: Fix Duplicate Issues (Immediate)**
1. Remove "Royal Academy of Engineering" from `ai-unique-value` on:
   - app-development.astro
   - product-design.astro
2. Replace with: "Experienced award-winning team with proven track record"

### **Phase 2: Enhance Location Pages (Priority)**
Location pages are missing AI metadata completely:
1. Add all Tier 4 AI tags
2. Ensure geo tags are accurate
3. Make descriptions location-specific

### **Phase 3: Complete Service Pages (Medium Priority)**
Service pages with partial metadata:
1. Add missing AI tags
2. Ensure uniqueness
3. Verify accuracy

### **Phase 4: Quality Check (Final)**
1. Verify no duplicate descriptions
2. Verify Royal Academy only on 3 pages
3. Test AI metadata with ChatGPT/Perplexity
4. Check meta tag lengths (descriptions 150-160 chars)

---

## 📝 Template for AI Metadata (Service Pages)

```html
<!-- AI-Specific Optimization Tags -->
<meta name="ai-generated" content="false" slot="head">
<meta name="ai-purpose" content="[specific service purpose, e.g., chatgpt-optimization, local-seo-cardiff]" slot="head">
<meta name="ai-target" content="[specific audience, e.g., cardiff-businesses, b2b-companies-newport]" slot="head">
<meta name="ai-keywords" content="[unique keywords for this page/service/location]" slot="head">
<meta name="ai-content-type" content="[page type, e.g., local-seo-provider, aeo-specialist]" slot="head">
<meta name="ai-business-type" content="[business classification]" slot="head">
<meta name="ai-service-area" content="[geographic reach for this page]" slot="head">

<!-- Advanced AI Optimization -->
<meta name="ai-language" content="en-GB" slot="head">
<meta name="ai-context" content="[page-specific context]" slot="head">
<meta name="ai-industry" content="[relevant industries]" slot="head">
<meta name="ai-services" content="[detailed, unique service list]" slot="head">
<meta name="ai-audience" content="[detailed audience segments]" slot="head">
<meta name="ai-intent" content="[user search intents this page serves]" slot="head">
<meta name="ai-unique-value" content="[USPs - NO Royal Academy unless Homepage/About/Darran page]" slot="head">
```

---

## ✅ Quality Checklist Before Publishing

- [ ] All descriptions are unique (no duplicates)
- [ ] Royal Academy ONLY on Homepage, About, Darran's page
- [ ] All AI metadata is contextually relevant
- [ ] Geographic data is accurate
- [ ] Keywords match page content
- [ ] No keyword stuffing
- [ ] OG images exist and are correct
- [ ] Canonical URLs are correct
- [ ] No broken links in metadata
