import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';

interface AuthFormProps {
  selectedPlan?: string | null;
}

export function AuthForm({ selectedPlan }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(!!selectedPlan);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Update register mode if plan is selected
  React.useEffect(() => {
    if (selectedPlan) setIsRegistering(true);
  }, [selectedPlan]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your email to confirm registration!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {selectedPlan && isRegistering && (
        <div className="bg-[#ff0055]/10 border border-[#ff0055]/30 p-4 rounded-xl flex flex-col items-center">
          <span className="text-[#ff0055] text-[10px] font-black uppercase tracking-widest">Selected Plan</span>
          <span className="text-white font-bold text-lg">{selectedPlan}</span>
        </div>
      )}
      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff0055] transition-colors" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-all"
            required
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff0055] transition-colors" size={18} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-all"
            required
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-[10px] font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff0055] hover:bg-[#e6004d] text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,85,0.3)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : (isRegistering ? 'Create Account' : 'Access Server')}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          {isRegistering ? 'Already have access? Log In' : 'Need access? Request Account'}
        </button>
      </div>
    </div>
  );
}