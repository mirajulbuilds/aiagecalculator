import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string;
  breadcrumbs?: BreadcrumbItem[];
  isHomePage?: boolean;
}

export const SEOHead = ({
  title,
  description,
  image = 'https://aiagecalc.com/og-image.jpg',
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  keywords,
  breadcrumbs,
  isHomePage = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes('AiAgeCalc') ? title : `${title} | AiAgeCalc`;
  const canonicalUrl = url || `https://aiagecalc.com${typeof window !== 'undefined' ? window.location.pathname : ''}`;
  const imageUrl = image.startsWith('http') ? image : `https://aiagecalc.com${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="AiAgeCalc" />
      <meta property="og:locale" content="en_US" />

      {/* Article specific tags */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@aiagecalc" />
      <meta name="twitter:creator" content="@aiagecalc" />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* Organization + WebSite JSON-LD (homepage) */}
      {isHomePage && (
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://aiagecalc.com/#organization",
              "name": "AiAgeCalc",
              "url": "https://aiagecalc.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://aiagecalc.com/favicon.png"
              },
              "sameAs": []
            },
            {
              "@type": "WebSite",
              "@id": "https://aiagecalc.com/#website",
              "url": "https://aiagecalc.com",
              "name": "AiAgeCalc",
              "publisher": { "@id": "https://aiagecalc.com/#organization" },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://aiagecalc.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ]
        })}</script>
      )}

      {/* Breadcrumb JSON-LD */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        })}</script>
      )}
    </Helmet>
  );
};