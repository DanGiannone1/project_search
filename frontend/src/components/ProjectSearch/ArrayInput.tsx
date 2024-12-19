// frontend/src/components/ProjectSearch/ArrayInput.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  multiline?: boolean;
  approvedTags?: string[];
  category?: 'programming_languages' | 'frameworks' | 'azure_services' | 'design_patterns' | 'industry';
  azureServicesData?: {
    application: string[];
    data: string[];
    ai: string[];
  };
  azureServiceCategory?: 'application' | 'data' | 'ai';
}

const ArrayInput = ({ 
  value, 
  onChange, 
  placeholder, 
  label, 
  className,
  multiline = false,
  approvedTags,
  category,
  azureServicesData,
  azureServiceCategory
}: ArrayInputProps) => {
  // State for the raw text input
  const [text, setText] = useState(value.join(', ')); // Changed from \n to ', '
  const [invalidTags, setInvalidTags] = useState<string[]>([]);

  // Update internal text when external value changes
  useEffect(() => {
    // For multiline inputs, use newlines; otherwise use commas
    const separator = multiline ? '\n' : ', ';
    setText(value.join(separator));
  }, [value, multiline]);

  // Check for invalid tags whenever value or approvedTags change
  useEffect(() => {
    if (!value) {
      setInvalidTags([]);
      return;
    }

    let validTagList: string[] = [];

    if (category === 'azure_services' && azureServicesData && azureServiceCategory) {
      // For Azure services, check against the specific subcategory
      validTagList = azureServicesData[azureServiceCategory] || [];
    } else if (approvedTags) {
      // For other categories, use the direct approved tags list
      validTagList = approvedTags;
    }

    if (validTagList.length > 0) {
      const invalid = value.filter(tag => !validTagList.includes(tag));
      setInvalidTags(invalid);
    } else {
      setInvalidTags([]);
    }
  }, [value, approvedTags, category, azureServicesData, azureServiceCategory]);

  // Process text into array when user finishes typing
  const handleBlur = () => {
    const processedArray = text
      .split(/[\n,]/) // Split on newlines or commas
      .map(item => item.trim())
      .filter(item => item.length > 0);
    onChange(processedArray);
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold mb-1 text-indigo-400">
            {label}
          </label>
          {invalidTags.length > 0 && (
            <div className="flex items-center text-yellow-500 text-xs">
              <AlertCircle className="w-4 h-4 mr-1" />
              Non-approved tags detected
            </div>
          )}
        </div>
      )}
      <InputComponent
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`bg-neutral-800 border-neutral-700 text-white ${
          invalidTags.length > 0 ? 'border-yellow-500/50' : ''
        } ${className}`}
      />
      {invalidTags.length > 0 && (
        <div className="text-xs text-yellow-500">
          Non-approved tags: {invalidTags.join(', ')}
        </div>
      )}
      {!multiline && (
        <p className="text-xs text-gray-400 mt-1">
          Type or paste items, separated by commas or new lines
        </p>
      )}
    </div>
  );
};

export default ArrayInput;