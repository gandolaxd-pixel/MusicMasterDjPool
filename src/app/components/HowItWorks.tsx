import { motion } from 'motion/react';
import { UserPlus, CheckCircle2, Download } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Sign Up',
    description: 'Create your account and tell us about your DJ experience',
  },
  {
    icon: CheckCircle2,
    number: '02',
    title: 'Get Approved',
    description: 'Our team verifies your professional DJ status (usually within 24 hours)',
  },
  {
    icon: Download,
    number: '03',
    title: 'Access the Download Server',
    description: 'Start downloading unlimited tracks in your preferred format',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg">
            Get started in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Number Badge */}
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full border border-red-500/30 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Icon size={48} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-black border-2 border-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{step.number}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
