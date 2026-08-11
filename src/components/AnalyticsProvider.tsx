import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsId = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('value')
        .eq('id', 'analytics_id')
        .single();
      
      if (data && data.value) {
        setAnalyticsId(data.value);
      }
    };

    fetchAnalyticsId();
  }, []);

  return (
    <>
      {analyticsId && (
        <Helmet>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${analyticsId}');
            `}
          </script>
        </Helmet>
      )}
      {children}
    </>
  );
};
