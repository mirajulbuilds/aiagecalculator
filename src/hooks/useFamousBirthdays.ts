import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FamousBirthday {
  id: string;
  name: string;
  dob: string;
  profession: string;
  famous_for?: string;
  country?: string;
  region_category?: 'Regional' | 'Global';
  bio?: string;
  image_url?: string;
  source_url?: string;
  popularity_score?: number;
  social_links?: Record<string, string>;
  today_trending?: boolean;
  ai_summary?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseFamousBirthdaysParams {
  dob?: string;
  region?: string;
  top?: number;
  trending?: boolean;
}

export const useFamousBirthdays = (params: UseFamousBirthdaysParams = {}) => {
  return useQuery({
    queryKey: ['famous-birthdays', params],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('explore-famous-birthdays', {
        body: params
      });

      if (error) throw error;
      
      return data as { success: boolean; count: number; data: FamousBirthday[] };
    },
  });
};

export const seedCelebritiesDatabase = async (celebrities: any[]) => {
  const { data, error } = await supabase.functions.invoke('seed-celebrities', {
    body: { celebrities }
  });

  if (error) throw error;
  return data;
};
