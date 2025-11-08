
import { LucideIcon } from 'lucide-react';

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureItem = ({ icon: Icon, title, description }: FeatureItemProps) => {
  return (
    <div className="flex">
      <div className="bg-primary/10 text-primary p-2 rounded-full shrink-0 mr-4">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureItem;
