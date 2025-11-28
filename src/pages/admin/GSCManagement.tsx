import { GSCSitemapSubmitter } from '@/components/GSCSitemapSubmitter';
import { GSCSubmissionLogs } from '@/components/GSCSubmissionLogs';
import { RedirectAnalytics } from '@/components/RedirectAnalytics';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GSCManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/admin')} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SEO & Redirects Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage Google Search Console submissions and redirect analytics
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <GSCSitemapSubmitter />
        <GSCSubmissionLogs />
        <RedirectAnalytics />
      </div>
    </div>
  );
};

export default GSCManagement;
