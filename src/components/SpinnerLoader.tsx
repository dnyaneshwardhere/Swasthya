
import { Loader2 } from "lucide-react";

interface SpinnerLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const SpinnerLoader = ({ size = 'md', text = 'Loading...' }: SpinnerLoaderProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-health-blue-500`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default SpinnerLoader;
