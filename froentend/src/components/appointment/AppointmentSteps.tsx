
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentStepsProps {
  currentStep: number;
  stepNames?: string[];
}

const AppointmentSteps = ({ 
  currentStep, 
  stepNames = ['Select Doctor', 'Choose Time', 'Patient Info'] 
}: AppointmentStepsProps) => {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="flex items-center justify-between">
        {stepNames.map((stepName, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center"
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep > index + 1 
                  ? 'bg-primary text-primary-foreground' 
                  : currentStep === index + 1 
                    ? 'border-2 border-primary text-primary' 
                    : 'border-2 border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {currentStep > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            <div className={`text-xs mt-2 ${currentStep >= index + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {stepName}
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-3">
        <div className="absolute top-0 left-8 right-8 flex">
          <div className={`h-0.5 flex-1 ${currentStep > 1 ? 'bg-primary' : 'bg-border'}`}></div>
          <div className={`h-0.5 flex-1 ${currentStep > 2 ? 'bg-primary' : 'bg-border'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSteps;
