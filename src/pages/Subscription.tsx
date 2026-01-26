import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

export const SubscriptionPage = ({ user }: { user: any }) => {
    const [profile, setProfile] = useState<any>(null);


    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            // Primero intentamos pillar el perfil, si no existe (raro), se crea ficticio
            let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (error || !data) {
                // Fallback default
                data = { subscription_status: 'free', subscription_plan: 'basic' };
            }
            setProfile(data);

        };
        fetchProfile();
    }, [user]);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                    My <span className="text-[#ff0055]">Subscription</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* STATUS CARD */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Current Status</h3>

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${profile?.subscription_status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-[#ff0055]/20 text-[#ff0055]'}`}>
                            {profile?.subscription_status === 'active' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white uppercase">{profile?.subscription_status || 'FREE'}</div>
                            <div className="text-sm text-gray-400 font-bold uppercase">{profile?.subscription_plan || 'Basic'} PLAN</div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-6" />

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Email</span>
                            <span className="text-white font-mono">{user?.email}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Member Since</span>
                            <span className="text-white font-mono">{new Date(user?.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* ACTIONS CARD */}
                <div className="bg-gradient-to-br from-[#111] to-black border border-white/10 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                    <CreditCard size={48} className="text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Want to upgrade?</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">Get unlimited access to thousands of exclusive DJ edits, remixes and extended versions.</p>
                    <button className="px-8 py-3 bg-[#ff0055] hover:bg-[#ff0055]/80 text-white font-black uppercase text-xs tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(255,0,85,0.3)]">
                        Upgrade Plan
                    </button>
                </div>
            </div>
        </div>
    );
};
