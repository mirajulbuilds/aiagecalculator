import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { blogPosts } from "@/data/blogPosts";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const Blog = () => {
  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>Birthday & Age Calculator Blog | Insights, Traditions & Science</title>
        <meta 
          name="description" 
          content="Explore fascinating articles about birthday traditions, zodiac signs, planetary age calculations, and more. Expert insights on birthdays and celebrations worldwide." 
        />
        <meta name="keywords" content="birthday blog, age calculator articles, birthday traditions, zodiac personality, Mars age calculation" />
      </Helmet>

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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
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
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
    </PageTransition>
  );
};

export default Blog;
