# Crypto News Site

This is a Next.js project for a crypto news site, designed to function as a professional news publisher focused on the cryptocurrency industry.

## High-Level Site Structure

### Home
- **Path:** `/`
- **Content:** Hero section with top headlines, breaking news ticker, and a market overview widget. Sections for "Latest News", "Bitcoin", "Altcoins", "DeFi", "NFTs", "Guides/Explainers", and "Opinion".

### News Categories
- **/news**: All news, paginated, sortable by latest/most read.
- **/news/bitcoin**
- **/news/altcoins**
- **/news/defi**
- **/news/nft**
- **/news/regulation**
- **/news/markets**

### Article Types
- **/news/[slug]**: Breaking news and updates.
- **/analysis/[slug]**: Deep dives, on-chain analysis, and long-form content.
- **/guides/[slug]**: Evergreen explainer content for long-tail SEO.
- **/opinion/[slug]**: Editorial content with an emphasis on the author.

### Supporting Pages
- **/about**: Mission, editorial policy, team, and disclaimers.
- **/contact**: Contact form, press email, and social media links.
- **/authors/[slug]**: Author biography, photo, and links to all their articles.
- **/privacy-policy**, **/terms**, **/disclaimer**, **/cookies**: Legal pages.

### Utility Pages
- **/search**: Full-text search with filters (category, date, tags).
- **/tags/[slug]**: Topic pages for tags like "ETF", "halving", "layer-2", "airdrops".
- **/newsletter**: Crypto newsletter landing page with archives.

## Content Management

### Dashboard
- **Path:** `/dashboard`
- **Content:** A dynamic dashboard for creating and managing blog posts.
- **Features:**
    - **Dynamic Content Blocks:** Add and arrange content blocks such as H1, H2, H3, paragraphs, textareas, buttons, and images.
    - **Image Uploads:** Upload images from your local machine to be included in your posts.
    - **Button Links:** Add links to buttons.
    - **Save to Firebase:** Save the blog post structure to a Firestore collection.

## Layout Patterns and Components

### Home/Category Layout
- **Top:** Featured story with a large image and bold headline.
- **Side:** "Trending" or "Most Read" list.
- **Grids/Lists:** Article cards showing category, headline, excerpt, time, and source.

### Article Page Layout
- **Above Fold:** Category label, headline, subheadline, publish/updated time, author, read time, and social share buttons.
- **Body:** Summary paragraph, clear headings, quotes, charts, and embedded content.
- **Sidebar/Bottom:** "Related Articles," "More on [category]," author box, disclaimers, and tags.

### Crypto-Specific Components
- **Market Ticker Bar:** BTC, ETH, and top 5-10 coins with price, change, and market cap.
- **Individual Coin Pages:** (Optional) `/coins/[symbol]` with a price chart and news for that coin.

## SEO for a Crypto News Site

- **Content & Headlines:** Clear, keyword-focused headlines. Original reporting and value-added content.
- **Structured Data & Sitemaps:** Use `Article`/`NewsArticle` schema. Maintain a general sitemap and a news-specific sitemap.
- **Performance & Mobile:** Optimize for Core Web Vitals and consider AMP for news articles.

## Next.js Implementation Checklist

- **Routing & Data Fetching:** Use the App Router with static generation (ISR) for articles.
- **Metadata API:** Use `generateMetadata` for dynamic routes to set titles, descriptions, and social media tags.
- **JSON-LD Helper:** Create a shared component to inject `NewsArticle`/`Article` schema.
- **Sitemaps and robots.txt:** Generate `sitemap.xml`, `sitemap-news.xml`, and `robots.txt`.

## Audience Interaction & Trust

- **Engagement:** Comments on articles, community links (Discord/Telegram), and a newsletter.
- **Trust Signals:** Clear editorial guidelines, disclaimers, and author profiles with credentials.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
