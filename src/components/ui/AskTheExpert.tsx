import React, { useState } from 'react';
import { MessageSquareQuote, CheckCircle2, User, Send } from 'lucide-react';

interface QandA {
  id: string;
  productId: string;
  user: string;
  question: string;
  date: string;
  answer?: string;
  adminApproved: boolean;
}

const mockQA: QandA[] = [
  {
    id: '1',
    productId: '1', // Will match some products loosely, or we can just show generic ones if it doesn't match
    user: 'Emeka',
    question: 'Does this come with a manufacturer warranty?',
    date: '2023-10-15',
    answer: 'Yes, it comes with a standard 1-year manufacturer warranty from the date of purchase.',
    adminApproved: true,
  },
  {
    id: '2',
    productId: '1',
    user: 'Sarah',
    question: 'Is installation included in the price?',
    date: '2023-11-02',
    answer: 'Installation is not included in the base price, but we offer professional installation services in Asaba for an additional fee.',
    adminApproved: true,
  },
  {
    id: '3',
    productId: '2',
    user: 'John',
    question: 'What is the power consumption?',
    date: '2024-01-10',
    answer: 'It is highly energy-efficient. Specific consumption depends on usage, but it is rated A+ for energy savings.',
    adminApproved: true,
  }
];

export const AskTheExpert = ({ productId, productName }: { productId: string, productName: string }) => {
  const [questions, setQuestions] = useState<QandA[]>(
    mockQA.filter(qa => qa.productId === productId || qa.productId === '1') // fallback to '1' so there's always some data to show for mockup
  );
  
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setNewQuestion('');
      
      // In a real app, this would go to a moderation queue
      // For the mock, we can just show a success message
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 500);
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquareQuote size={24} className="text-red-600" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          Ask The Expert
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">
              Have a question about {productName}?
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Our Longlife electronics experts are here to help. Ask us anything about specifications, installation, or warranty.
            </p>

            {isSubmitted ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-start gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-bold text-green-800 dark:text-green-400 uppercase tracking-widest mb-1">
                    Question Submitted
                  </h4>
                  <p className="text-[10px] text-green-600 dark:text-green-500">
                    Thank you! Your question has been sent to our experts and is pending approval.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="question" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Your Question
                  </label>
                  <textarea
                    id="question"
                    required
                    rows={4}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="E.g., Does this model support 220V?"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 dark:text-slate-900 dark:hover:text-white text-white font-bold py-3 px-6 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} /> Submit Question
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Q&A List */}
        <div className="lg:col-span-2">
          <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            Customer Questions & Answers ({questions.length})
          </h3>
          
          <div className="space-y-8">
            {questions.map((qa) => (
              <div key={qa.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <User size={14} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-black text-slate-900 dark:text-white">{qa.user}</span>
                    <span className="text-[10px] text-slate-400">• {new Date(qa.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[13px] text-slate-800 dark:text-slate-200 font-bold mb-3">
                    Q: {qa.question}
                  </p>
                  
                  {qa.answer && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-l-2 border-red-600 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                          Longlife Expert
                        </span>
                        <CheckCircle2 size={12} className="text-red-600" />
                      </div>
                      <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {qa.answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
