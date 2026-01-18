import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'Best DJ pool I\'ve used. The quality and selection are unmatched. Weekly updates keep my sets fresh.',
    name: 'DJ Mira',
    city: 'Dubai',
    role: 'Club Resident',
  },
  {
    quote: 'Clean edits, perfect transitions. This pool understands what working DJs actually need.',
    name: 'Carlos Rivera',
    city: 'Miami',
    role: 'Wedding & Events',
  },
  {
    quote: 'The Afro House and Tech House selection is incredible. Finally, a pool that gets underground music.',
    name: 'Alex Schmidt',
    city: 'Berlin',
    role: 'Festival DJ',
  },
  {
    quote: 'Game changer for my Latin sets. Exclusive remixes I can\'t find anywhere else.',
    name: 'Isabella Torres',
    city: 'Buenos Aires',
    role: 'Radio & Club DJ',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Trusted by DJs Worldwide
          </h2>
          <p className="text-gray-400 text-lg">
            See what professional DJs are saying
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-all"
            >
              <Quote size={32} className="text-red-500 mb-4" />
              <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <div className="text-white font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
                <div className="text-sm text-blue-400 mt-1">{testimonial.city}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
