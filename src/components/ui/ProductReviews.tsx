import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store';

interface ProductReviewsProps {
  productId: string;
  rating: number;
  reviewsCount: number;
}

export const ProductReviews = ({ productId, rating, reviewsCount }: ProductReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const { user, toast } = useStore();
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (data) setReviews(data);
    };
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to submit a review.', 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: user.id,
      rating: form.rating,
      comment: form.comment
    });
    
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Review submitted successfully!');
      setShowReviewForm(false);
      setForm({ rating: 5, comment: '' });
      const { data } = await supabase.from('product_reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
      if (data) setReviews(data);
    }
    setSubmitting(false);
  };

  return (
    <div id="reviews" className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black text-slate-900 dark:text-white">{rating.toFixed(1)}</div>
            <div>
              <div className="flex items-center text-yellow-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(rating) ? "fill-yellow-400" : "fill-slate-200 text-slate-200"} />
                ))}
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Based on {reviewsCount} reviews</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-6 text-[11px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white hover:text-white transition-colors"
        >
          {showReviewForm ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {showReviewForm && (
        <form onSubmit={handleSubmit} className="mb-12 bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 fade-in duration-300">
          <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Submit Your Review</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rating</label>
              <select value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors">
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Poor</option>
                <option value="1">1 Star - Terrible</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Review</label>
              <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} required rows={4} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" placeholder="What did you like or dislike about this product?"></textarea>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="bg-red-600 text-white font-bold py-3 px-8 text-[11px] uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}



      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-[13px] text-slate-500">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-[13px] text-slate-900 dark:text-white mr-3">{review.reviewer_name || 'Customer'}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < review.rating ? "fill-yellow-400" : "fill-slate-200 text-slate-200"} />
                  ))}
                </div>
              </div>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
