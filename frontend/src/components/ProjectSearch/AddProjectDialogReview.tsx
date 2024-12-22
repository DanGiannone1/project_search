import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Project } from './types';
import ArrayInput from './ArrayInput';

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
      <div>
        <label className="block text-sm font-semibold mb-1 text-indigo-400">GitHub URL</label>
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

      <div>
        <label className="block text-sm font-semibold mb-1 text-indigo-400">Owner</label>
        <Input
          value={extractedData.owner || 'anonymous'}
          onChange={(e) =>
            setExtractedData({
              ...extractedData,
              owner: e.target.value,
            })
          }
          className="bg-neutral-800 border-neutral-700 text-white h-12"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-indigo-400">Project Name</label>
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

      <div>
        <label className="block text-sm font-semibold mb-1 text-indigo-400">Project Description</label>
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

      <ArrayInput
        label="Programming Languages"
        value={extractedData.programmingLanguages || []}
        onChange={(value) =>
          setExtractedData({
            ...extractedData,
            programmingLanguages: value,
          })
        }
        placeholder="Enter programming languages..."
      />

      <ArrayInput
        label="Frameworks"
        value={extractedData.frameworks || []}
        onChange={(value) =>
          setExtractedData({
            ...extractedData,
            frameworks: value,
          })
        }
        placeholder="Enter frameworks..."
      />

      <ArrayInput
        label="Azure Services"
        value={extractedData.azureServices || []}
        onChange={(value) =>
          setExtractedData({
            ...extractedData,
            azureServices: value,
          })
        }
        placeholder="Enter Azure services..."
      />

      <ArrayInput
        label="Design Patterns"
        value={extractedData.designPatterns || []}
        onChange={(value) =>
          setExtractedData({
            ...extractedData,
            designPatterns: value,
          })
        }
        placeholder="Enter design patterns..."
      />

      <ArrayInput
        label="Industries"
        value={extractedData.industries || []}
        onChange={(value) =>
          setExtractedData({
            ...extractedData,
            industries: value,
          })
        }
        placeholder="Enter industries..."
        multiline={true}
      />

      <ArrayInput
        label="Customers"
        value={extractedData.customers || []}
        onChange={(value) =>
          setExtractedData({
            ...extractedData,
            customers: value,
          })
        }
        placeholder="What customers have leveraged this repo?"
        multiline={true}
      />

      <div>
        <label className="block text-sm font-semibold mb-1 text-indigo-400">Project Type</label>
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

      <div>
        <label className="block text-sm font-semibold mb-1 text-indigo-400">Code Complexity</label>
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

      <div>
        <label className="block text-sm font-semibold mb-1 text-indigo-400">Business Value</label>
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

      <div>
        <label className="block text-sm font-semibold mb-1 text-indigo-400">Target Audience</label>
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

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

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