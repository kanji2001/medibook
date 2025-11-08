
import { ChevronRight } from 'lucide-react';

export interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reason: string;
  notes: string;
}

interface PatientInfoFormProps {
  formData: PatientFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const PatientInfoForm = ({ formData, onInputChange, onSubmit, onBack }: PatientInfoFormProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="heading-lg text-center mb-8">Patient Information</h1>
      
      <div className="glass-card rounded-xl p-6 mb-6">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.firstName}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.lastName}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.email}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.phone}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="reason">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.reason}
              onChange={onInputChange}
              required
            >
              <option value="">Select a reason</option>
              <option value="New Patient Consultation">New Patient Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Annual Check-up">Annual Check-up</option>
              <option value="Specific Concern">Specific Concern</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="notes">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.notes}
              onChange={onInputChange}
              placeholder="Please share any specific concerns or information that might be helpful for the doctor."
            ></textarea>
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              type="button"
              className="btn-outline"
              onClick={onBack}
            >
              Back
            </button>
            <button 
              type="submit"
              className="btn-primary"
            >
              Request Appointment
              <ChevronRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientInfoForm;
