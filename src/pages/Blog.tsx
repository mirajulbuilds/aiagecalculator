import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { blogPosts } from "@/data/blogPosts";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CombinedBlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  author: string;
  publishedDate: string;
  featuredImage: string;
}

const Blog = () => {
  const [dbPosts, setDbPosts] = useState<CombinedBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false });

        if (error) throw error;

        const mappedPosts: CombinedBlogPost[] = (data || []).map(post => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          summary: post.meta_description,
          author: post.author || 'AI Age Calculator Team',
          publishedDate: post.published_at || post.created_at,
          featuredImage: post.featured_image_url || '/placeholder.svg'
        }));

        setDbPosts(mappedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const staticPosts: CombinedBlogPost[] = blogPosts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    author: post.author,
    publishedDate: post.publishedDate,
    featuredImage: post.featuredImage
  }));

  const allPosts = [...dbPosts, ...staticPosts].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );

  return (
    <PageTransition>
    <SEOHead
      title="Birthday & Age Calculator Blog - Insights, Traditions & Science"
      description="Explore fascinating articles about birthday traditions, zodiac signs, planetary age calculations, and more. Expert insights on birthdays and celebrations worldwide."
      keywords="birthday blog, age calculator articles, birthday traditions, zodiac personality, Mars age calculation"
      type="website"
    />
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Blog
              </h1>
              <p className="text-muted-foreground mt-2">
                Insights, traditions, and science about birthdays and age
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/" className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((post, index) => (
            <ScrollFadeIn key={post.id} delay={index * 100}>
              <Link to={`/blog/${post.slug}`} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary/50">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.publishedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {post.summary}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      <span className="line-clamp-1">Read more: {post.title}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </ScrollFadeIn>
          ))}
          </div>
        )}
      </main>
    </div>
    </PageTransition>
  );
};

export default Blog;
