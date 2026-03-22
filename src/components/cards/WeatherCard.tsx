import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface WeatherCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'steady';
  className?: string;
  variant?: 'default' | 'glass' | 'accent';
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  description, 
  className,
  variant = 'default' 
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={twMerge(
        "relative overflow-hidden p-6 rounded-[2rem] transition-all duration-300 group",
        variant === 'default' && "bg-surface-container-low hover:bg-surface-container",
        variant === 'glass' && "glass text-foreground",
        variant === 'accent' && "bg-surface-container-high relative",
        className
      )}
    >
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground/60 group-hover:text-primary transition-colors">
            {title}
          </span>
          <div className="p-2.5 rounded-xl bg-background/50 group-hover:bg-primary/10 transition-colors">
            <Icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-3xl font-semibold tracking-[-0.02em]">{value}</span>
            {unit && <span className="text-sm font-medium text-muted-foreground/50">{unit}</span>}
          </div>
          {description && (
            <p className="mt-2 text-[11px] font-medium text-muted-foreground/50 group-hover:text-muted-foreground transition-colors leading-tight relative z-10">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Subtle background glow on hover */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 z-0" />
    </motion.div>
  );
};
