import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ValidatedArrayInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  approvedTags?: string[];
  multiline?: boolean;
  onValidationChange?: (isValid: boolean) => void;  // Added this prop
}

const ValidatedArrayInput: React.FC<ValidatedArrayInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "Type or paste items, separated by commas or new lines",
  approvedTags,
  onValidationChange  // Added this prop
}) => {
  const [inputValue, setInputValue] = useState('');
  const [invalidTags, setInvalidTags] = useState<string[]>([]);

  // Validate all tags whenever value or approvedTags changes
  useEffect(() => {
    if (approvedTags) {
      const invalid = value.filter(tag => !approvedTags.includes(tag));
      setInvalidTags(invalid);
      // Notify parent component about validation state
      onValidationChange?.(invalid.length === 0);
    }
  }, [value, approvedTags, onValidationChange]);

  const getErrorMessage = (tags: string[]) => {
    if (tags.length === 0) return null;
    return `"${tags.join('", "')}" ${tags.length === 1 ? 'is' : 'are'} not approved ${tags.length === 1 ? 'tag' : 'tags'}`;
  };

  const addTags = (input: string) => {
    const newTags = input
      .split(/[,\n]/)  // Split by commas or newlines
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newValidTags = newTags.filter(tag => !approvedTags || approvedTags.includes(tag));
    
    if (newValidTags.length > 0) {
      const uniqueNewTags = newValidTags.filter(tag => !value.includes(tag));
      if (uniqueNewTags.length > 0) {
        onChange([...value, ...uniqueNewTags]);
      }
    }
    setInputValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // If the input ends with a comma or newline, process it
    if (newValue.endsWith(',') || newValue.endsWith('\n')) {
      addTags(newValue.slice(0, -1));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTags(inputValue);
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const errorMessage = getErrorMessage(invalidTags);
  const hasError = invalidTags.length > 0;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold mb-1 text-indigo-400">
        {label}
      </label>
      {errorMessage && (
        <p className="text-red-400 text-xs">{errorMessage}</p>
      )}
      <div className={`flex flex-wrap gap-2 min-h-[38px] p-1.5 bg-neutral-800 rounded-md border ${hasError ? 'border-red-500' : 'border-neutral-700'}`}>
        {value.map(tag => (
          <div
            key={tag}
            className={`flex items-center px-2 py-1 rounded text-sm group ${
              invalidTags.includes(tag) 
                ? 'bg-red-900/50 text-red-200' 
                : 'bg-neutral-700 text-white'
            }`}
          >
            <span>{tag}</span>
            <button
              onClick={() => handleRemove(tag)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[200px] bg-transparent border-0 focus:ring-0 text-white placeholder-gray-400 text-sm p-0"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">Type or paste items, separated by commas or new lines</p>
    </div>
  );
};

export default ValidatedArrayInput;