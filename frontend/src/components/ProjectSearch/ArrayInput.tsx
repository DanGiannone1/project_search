import  { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  multiline?: boolean;
}

const ArrayInput = ({ 
  value, 
  onChange, 
  placeholder, 
  label, 
  className,
  multiline = false 
}: ArrayInputProps) => {
  // State for the raw text input
  const [text, setText] = useState(value.join(', ')); // Changed from \n to ', '

  // Update internal text when external value changes
  useEffect(() => {
    // For multiline inputs, use newlines; otherwise use commas
    const separator = multiline ? '\n' : ', ';
    setText(value.join(separator));
  }, [value, multiline]);

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
        <label className="block text-sm font-semibold mb-1 text-indigo-400">
          {label}
        </label>
      )}
      <InputComponent
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`bg-neutral-800 border-neutral-700 text-white ${className}`}
      />
      {!multiline && (
        <p className="text-xs text-gray-400 mt-1">
          Type or paste items, separated by commas or new lines
        </p>
      )}
    </div>
  );
};

export default ArrayInput;