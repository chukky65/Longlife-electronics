import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState(() => localStorage.getItem('longlife_cookie_consent') === 'true');

  useEffect(() => {
    const handleConsent = (event: Event) => {
      setHasConsent(Boolean((event as CustomEvent<boolean>).detail));
    };

    window.addEventListener('longlife:cookie-consent', handleConsent);
    return () => window.removeEventListener('longlife:cookie-consent', handleConsent);
  }, []);

  useEffect(() => {
    if (!hasConsent) {
      setAnalyticsId(null);
      return;
    }

    const fetchAnalyticsId = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('value')
        .eq('id', 'analytics_id')
        .single();
      
      if (data?.value && /^G-[A-Z0-9]+$/i.test(data.value)) {
        setAnalyticsId(data.value);
      }
    };

    fetchAnalyticsId();
  }, [hasConsent]);

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
