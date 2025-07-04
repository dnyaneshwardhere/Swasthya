
import React from 'react';
import { HeartPulse } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="health-gradient rounded-lg p-1.5 text-white">
        <HeartPulse className={`${sizeClasses[size]}`} />
      </div>
      {showText && (
        <div className={`font-bold ${textClasses[size]}`}>
          <span className="text-health-blue-600">Tele</span>
          <span className="text-health-green-600">Health</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
