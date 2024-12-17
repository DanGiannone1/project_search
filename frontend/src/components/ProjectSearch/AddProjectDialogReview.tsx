// frontend/src/components/ProjectSearch/AddProjectDialogReview.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
// Removed Select imports
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from '@/components/ui/select';
import { Project } from './types';

interface AddProjectDialogReviewProps {
  extractedData: Project;
  setExtractedData: React.Dispatch<React.SetStateAction<Project | null>>;
  error: string | null;
  isSubmittingProject: boolean;
  handleFinalSubmit: () => Promise<void>;
  handleClose: () => void;
}

const AddProjectDialogReview: React.FC<AddProjectDialogReviewProps> = ({
  extractedData,
  setExtractedData,
  error,
  isSubmittingProject,
  handleFinalSubmit,
  handleClose
}) => {
  const complexityOptions = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="space-y-4 mt-4">
      {/* GitHub URL */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">GitHub URL</label>
        <Input
          value={extractedData.githubUrl || ''}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              githubUrl: e.target.value,
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white"
          disabled
        />
      </div>
    {/* Owner */}
    <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Owner</label>
        <Input
            value={extractedData.owner || 'anonymous'}
            className="bg-neutral-800 border-neutral-700 text-white h-12"
            disabled
        />
    </div>
      {/* Project Name */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Project Name</label>
        <Input
          placeholder="Project Name"
          value={extractedData.projectName || ''}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              projectName: e.target.value,
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-12"
        />
      </div>

      {/* Project Description */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Project Description</label>
        <Textarea
          placeholder="Project Description"
          value={extractedData.projectDescription}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              projectDescription: e.target.value,
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-32"
        />
      </div>

      {/* Programming Languages */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Programming Languages (comma separated)</label>
        <Input
          placeholder="Programming Languages"
          value={extractedData.programmingLanguages?.join(', ') || ''}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              programmingLanguages: e.target.value.split(',').map(lang => lang.trim()),
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-12"
        />
      </div>

      {/* Frameworks */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Frameworks (comma separated)</label>
        <Input
          placeholder="Frameworks"
          value={extractedData.frameworks?.join(', ') || ''}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              frameworks: e.target.value.split(',').map(fw => fw.trim()),
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-12"
        />
      </div>

      {/* Azure Services */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Azure Services (comma separated)</label>
        <Input
          placeholder="Azure Services"
          value={extractedData.azureServices?.join(', ') || ''}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              azureServices: e.target.value.split(',').map(service => service.trim()),
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-12"
        />
      </div>

      {/* Design Patterns */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Design Patterns (comma separated)</label>
        <Input
          placeholder="Design Patterns"
          value={extractedData.designPatterns?.join(', ') || ''}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              designPatterns: e.target.value.split(',').map(dp => dp.trim()),
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-12"
        />
      </div>

      {/* Project Type */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Project Type</label>
        <Input
          placeholder="Project Type"
          value={extractedData.projectType || ''}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              projectType: e.target.value,
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-12"
        />
      </div>

      {/* Code Complexity */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Code Complexity</label>
        <div className="flex space-x-2">
          {complexityOptions.map((option) => (
            <Button
              key={option}
              variant={extractedData.codeComplexity === option ? 'accentGradient' : 'secondary'}
              onClick={() =>
                setExtractedData({
                  ...extractedData,
                  codeComplexity: option as 'Beginner' | 'Intermediate' | 'Advanced',
                })
              }
              className="flex-1"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Business Value */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Business Value</label>
        <Textarea
          placeholder="Business Value"
          value={extractedData.businessValue}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              businessValue: e.target.value,
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-32"
        />
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-teal-500">Target Audience</label>
        <Textarea
          placeholder="Target Audience"
          value={extractedData.targetAudience}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              targetAudience: e.target.value,
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-32"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Submit Button */}
      <Button
        className="w-full"
        onClick={handleFinalSubmit}
        disabled={isSubmittingProject}
        variant="accentGradient"
      >
        {isSubmittingProject ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting...</span>
          </div>
        ) : (
          <span>Submit Project</span>
        )}
      </Button>

      {/* Cancel Button */}
      <Button
        variant="secondary"
        className="w-full mt-2"
        onClick={handleClose}
      >
        Cancel
      </Button>
    </div>
  );
};

export default AddProjectDialogReview;
