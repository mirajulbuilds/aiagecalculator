import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { featuredCelebrities } from '@/data/celebrities';
import { seedCelebritiesDatabase } from '@/hooks/useFamousBirthdays';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const SeedDatabase: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedCelebritiesDatabase(featuredCelebrities);
      setResults(result);
      toast({
        title: 'Database Seeded Successfully',
        description: `Inserted: ${result.summary.inserted}, Duplicates: ${result.summary.duplicates}, Errors: ${result.summary.errors}`,
      });
    } catch (error) {
      toast({
        title: 'Seeding Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">Seed Celebrity Database</h1>
        <p className="text-muted-foreground mb-6">
          This will populate the explore_famous_birthdays table with celebrity data from the local celebrities.ts file.
        </p>
        
        <Button 
          onClick={handleSeed} 
          disabled={isSeeding}
          className="w-full mb-6"
        >
          {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSeeding ? 'Seeding Database...' : 'Seed Database Now'}
        </Button>

        {results && (
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Seeding Results:</h2>
            <ul className="space-y-1 text-sm">
              <li>✅ Total Processed: {results.summary.total_processed}</li>
              <li>✅ Successfully Inserted: {results.summary.inserted}</li>
              <li>⚠️ Duplicates Skipped: {results.summary.duplicates}</li>
              <li>❌ Errors: {results.summary.errors}</li>
            </ul>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h3 className="font-semibold mb-2">Note:</h3>
          <p className="text-sm text-muted-foreground">
            After seeding, you can access the data via the /api/explore-famous-birthdays endpoint with parameters:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• ?dob=YYYY-MM-DD - Filter by date of birth</li>
            <li>• ?region=country - Filter by country/region</li>
            <li>• ?top=10 - Limit results</li>
            <li>• ?trending=true - Only trending birthdays</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SeedDatabase;
