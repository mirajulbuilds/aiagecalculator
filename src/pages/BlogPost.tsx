import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { blogPosts } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import PageTransition from "@/components/PageTransition";
import ScrollProgress from "@/components/ScrollProgress";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Skeleton } from "@/components/ui/skeleton";

// Utility to fix any remaining bad URLs in content
const fixInternalLinks = (html: string): string => {
  if (!html) return html;
  
  // Replace any backend lovableproject URLs with public domain
  return html.replace(
    /https?:\/\/[a-f0-9-]+\.lovableproject\.com(\/[^"'\s<>]*)/gi,
    'https://aiagecalc.com$1'
  );
};

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedDate: string;
  featuredImage: string;
  metaDescription: string;
  isFromDatabase?: boolean;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        // Try to fetch from database first
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (data) {
          setPost({
            id: data.id,
            slug: data.slug,
            title: data.title,
            summary: data.meta_description,
            content: data.main_content,
            author: data.author || 'AI Age Calculator Team',
            publishedDate: data.published_at || data.created_at,
            featuredImage: data.featured_image_url || '/placeholder.svg',
            metaDescription: data.meta_description,
            isFromDatabase: true
          });
        } else {
          // Fallback to static posts
          const staticPost = blogPosts.find((p) => p.slug === slug);
          if (staticPost) {
            setPost({
              ...staticPost,
              isFromDatabase: false
            });
          }
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        // Fallback to static posts on error
        const staticPost = blogPosts.find((p) => p.slug === slug);
        if (staticPost) {
          setPost({
            ...staticPost,
            isFromDatabase: false
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <ScrollProgress />
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
              <Button asChild variant="ghost">
                <Link to="/blog" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </header>
          <article className="container mx-auto px-4 py-12 max-w-4xl">
            <Card className="overflow-hidden border-2">
              <Skeleton className="aspect-[21/9] w-full" />
              <div className="p-8 md:p-12">
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          </article>
        </div>
      </PageTransition>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ScrollProgress />
      <Helmet>
        <title>{post.title} | Birthday & Age Calculator Blog</title>
        <meta name="description" content={post.metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.publishedDate} />
        <meta property="article:author" content={post.author} />
      </Helmet>

      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost">
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </header>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="overflow-hidden border-2">
          <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 md:p-12">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.publishedDate}>
                    {new Date(post.publishedDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 italic">
                {post.summary}
              </p>
            </header>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {post.isFromDatabase ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(fixInternalLinks(post.content), {
                      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
                      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel']
                    })
                  }} 
                  className="blog-content"
                />
              ) : (
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold mt-6 mb-3 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to All Articles
            </Link>
          </Button>
        </div>
      </article>
    </div>
    </PageTransition>
  );
};

export default BlogPost;
