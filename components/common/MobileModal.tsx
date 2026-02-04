
import React, { useEffect } from 'react';
import { X, LucideIcon } from 'lucide-react';

interface MobileModalProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const MobileModal: React.FC<MobileModalProps> = ({ 
  title, subtitle, icon: Icon, iconColor, onClose, children, footer 
}) => {
  useEffect(() => {
    document.body.classList.add('mobile-modal-active');
    return () => document.body.classList.remove('mobile-modal-active');
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white lg:bg-transparent lg:p-12 lg:items-center lg:justify-center overflow-hidden">
      {/* Backdrop for Desktop */}
      <div 
        className="hidden lg:block absolute inset-0 bg-slate-950/60 backdrop-blur-xl" 
        onClick={onClose} 
      />

      <div className="relative flex flex-col w-full h-full lg:h-auto lg:max-h-[90vh] lg:max-w-2xl lg:rounded-[48px] bg-white lg:bg-white/10 lg:glass lg:shadow-2xl lg:border lg:border-white/30 overflow-hidden animate-in slide-in-from-bottom lg:zoom-in-95 duration-300">
        
        {/* Sticky Header */}
        <header className="flex items-center justify-between p-6 lg:p-10 border-b border-slate-100 lg:border-white/20 shrink-0 bg-white lg:bg-transparent sticky top-0 z-10 pt-safe">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${iconColor} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
              {subtitle && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="tap-target glass-card rounded-2xl text-slate-400 hover:text-slate-900 transition-all border-slate-100"
          >
            <X size={24} />
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <footer className="p-6 lg:p-10 bg-slate-50 lg:bg-white/5 border-t border-slate-100 lg:border-white/20 pb-safe">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default MobileModal;
