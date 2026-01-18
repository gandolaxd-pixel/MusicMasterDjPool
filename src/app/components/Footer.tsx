import { ShieldCheck, Mail, Zap } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] border-t border-white/5 py-12 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          
          {/* Brand & Professional Status */}
          <div className="max-w-xs">
            <div className="text-2xl font-black italic uppercase tracking-tighter mb-4">
              <span className="text-white">Music</span>
              <span className="text-[#ff0055]">Master</span>
            </div>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
              Private professional resource curated for elite DJs worldwide. 
              Access is strictly restricted to active members.
            </p>
          </div>

          {/* Discreet Support & Tech Info */}
          <div className="flex flex-col sm:flex-row gap-8 md:gap-12">
            <div className="flex items-center gap-3 text-gray-400 group cursor-pointer">
              <Mail size={18} className="text-[#ff0055]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Contact</span>
                <span className="text-xs font-bold group-hover:text-white transition-colors">Technical Support</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
              <ShieldCheck size={18} className="text-[#ff0055]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Security</span>
                <span className="text-xs font-bold italic">Encrypted Connection</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
              <Zap size={18} className="text-[#ff0055]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Server</span>
                <span className="text-xs font-bold">High-Speed CDN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Fair Use Disclaimer (Protección Legal Silenciosa) */}
        <div className="mt-16 pt-8 border-t border-white/[0.03]">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              © {currentYear} Music Master. All rights reserved.
            </p>
            
            {/* Disclaimer en color muy sutil (text-gray-800) para no llamar la atención */}
            <p className="text-[9px] text-gray-800 font-bold uppercase leading-relaxed max-w-2xl lg:text-right">
              All tracks are provided for promotional use and performance evaluation only. 
              Unauthorized distribution or public resale is strictly prohibited. 
              Music Master operates under professional DJ fair use standards.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}