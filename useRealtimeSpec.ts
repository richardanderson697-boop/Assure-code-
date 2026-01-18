import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const useRealtimeSpec = (setGeneratingSpec) => {
  useEffect(() => {
    const channel = supabase
      .channel('spec-updates')
      .on('postgres_changes', { event: 'UPDATE', table: 'specifications' }, (payload) => {
         if (payload.new.status === 'compliant') {
           setGeneratingSpec(false);
           // Update local state
         }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [setGeneratingSpec]);
};