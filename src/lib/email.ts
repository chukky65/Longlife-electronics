import { supabase } from './supabase';

export const sendOrderConfirmationEmail = async (orderId: string, email: string, name: string, total: number) => {
  return supabase.functions.invoke('send-receipt', {
    body: {
      orderId,
      email,
      name,
      total,
      kind: 'placed',
    },
  });
};
