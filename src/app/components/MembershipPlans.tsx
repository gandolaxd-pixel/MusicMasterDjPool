import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';

const plans = [
  {
    name: 'Pro Access',
    price: '$24.99',
    period: 'monthly',
    description: 'Full access to everything',
    features: [
      'Unlimited Usage',
      '40TB+ Library Access',
      'DJ Pools & Packs Included',
      'Exclusive Remixes & Edits',
      'High Quality MP3 & WAV',
      'Cancel Anytime',
    ],
    cta: 'Start Now',
    popular: true,
  }
];

interface MembershipPlansProps {
  onSelectPlan?: (planName: string) => void;
}

export function MembershipPlans({ onSelectPlan }: MembershipPlansProps) {
  const handlePlanSelect = (planName: string) => {
    if (onSelectPlan) {
      onSelectPlan(planName);
      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="plans" className="py-24 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-white mb-4 italic uppercase tracking-tighter">
            Membership <span className="text-[#ff0055]">Plans</span>
          </h2>
          <p className="text-gray-400 text-lg">
            All plans include full access to our 40TB library
          </p>
        </motion.div>

        <div className="flex justify-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.3 }
              }}
              className={`relative bg-white/[0.03] backdrop-blur-xl border rounded-3xl p-8 ${plan.popular
                ? 'border-[#ff0055] shadow-[0_0_40px_rgba(255,0,85,0.2)] py-12'
                : 'border-white/10'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="flex items-center gap-2 px-6 py-1 bg-[#ff0055] rounded-full text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-[#ff0055]/40">
                    <Star size={14} className="fill-white" />
                    Recommended
                  </div>
                </div>
              )}

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-white mb-2 uppercase italic">{plan.name}</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-black text-white italic tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-[#ff0055] font-bold text-sm uppercase">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gray-300 text-sm">
                      <Check size={18} className="flex-shrink-0 text-[#ff0055] mt-0.5" />
                      <span className="font-medium tracking-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ${plan.popular
                    ? 'bg-[#ff0055] text-white shadow-[0_0_20px_rgba(255,0,85,0.4)] hover:shadow-[#ff0055]/60 hover:scale-105'
                    : 'bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-[#ff0055]'
                    }`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-16"
        >
          Secure direct payment. <span className="text-white text-xs">No recurring hidden fees.</span>
        </motion.p>
      </div>
    </section>
  );
}