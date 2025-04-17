# Digital Visibility - Astro Website

This is the Astro version of the Digital Visibility website, configured for optimal deployment on Cloudflare Pages.

## Project Structure

```
Digital-Visibility-Astro/
├── public/             # Static assets (images, favicon, etc.)
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Footer.astro
│   │   ├── Navigation.astro
│   │   └── ... 
│   ├── layouts/        # Page layouts
│   │   └── MainLayout.astro
│   ├── pages/          # All routes/pages
│   │   ├── index.astro # Home page
│   │   ├── services/   # Service pages
│   │   │   ├── digital-marketing.astro
│   │   │   ├── app-development.astro
│   │   │   └── product-design.astro
│   │   └── ...
│   └── styles/         # Global styles
│       └── global.css
├── astro.config.mjs    # Astro configuration
├── package.json        # Project dependencies
└── tailwind.config.cjs # Tailwind CSS configuration
```

## Features

- Built with Astro for optimal performance and SEO
- Configured for Cloudflare Pages deployment
- Component-based architecture for maintainability
- Fully responsive design
- Uses Tailwind CSS for styling
- Optimized navigation and footer links

## Getting Started

### Prerequisites

- Node.js (v16.x or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Digital-Visibility-Astro
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and visit: `http://localhost:4321`

## Deployment to Cloudflare Pages

This project is configured to be deployed on Cloudflare Pages. Follow these steps to deploy:

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. Log in to your Cloudflare account and navigate to the Pages section

3. Create a new project and connect your Git repository

4. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables: None required

5. Deploy!

### Cloudflare Pages Adapter

This project uses the `@astrojs/cloudflare` adapter, which ensures that your site will work optimally when deployed to Cloudflare Pages.

## Additional Information

- The navigation and footer components are designed to be reused across all pages.
- All links in the navigation and footer are properly configured to point to their respective pages.
- The site uses a modern component-based architecture which makes it easy to maintain and update.

## License

This project is for Digital Visibility Ltd. All rights reserved.
