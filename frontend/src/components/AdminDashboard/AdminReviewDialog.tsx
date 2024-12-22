import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Project, ApprovedTags } from '@/components/ProjectSearch/types';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import ValidatedArrayInput from './ValidatedArrayInput';
import ArrayInput from '../ProjectSearch/ArrayInput';

interface AdminReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onApprove: (updatedProject: Project) => void;
  onReject: (id: string, reason: string) => void;
  approvedTags: ApprovedTags | null;
}

const AdminReviewDialog: React.FC<AdminReviewDialogProps> = ({
  isOpen,
  onClose,
  project,
  onApprove,
  onReject,
  approvedTags
}) => {
  const [editedProject, setEditedProject] = useState<Project>({ ...project });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [validationStates, setValidationStates] = useState({
    programmingLanguages: true,
    frameworks: true,
    azureServices: true,
    designPatterns: true,
    industries: true
  });

  const validateProject = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!editedProject.projectName?.trim()) {
      errors.projectName = 'Project name is required';
    }

    if (!editedProject.projectDescription?.trim()) {
      errors.projectDescription = 'Project description is required';
    }

    if (!editedProject.businessValue?.trim()) {
      errors.businessValue = 'Business value is required';
    }

    if (!editedProject.targetAudience?.trim()) {
      errors.targetAudience = 'Target audience is required';
    }

    if (!editedProject.codeComplexity) {
      errors.codeComplexity = 'Code complexity is required';
    }

    setValidationErrors(errors);
    
    // Check if all tag validations pass and there are no field errors
    const allTagsValid = Object.values(validationStates).every(state => state);
    const noFieldErrors = Object.keys(errors).length === 0;
    
    return allTagsValid && noFieldErrors;
  };

  const handleValidationChange = (field: keyof typeof validationStates) => (isValid: boolean) => {
    setValidationStates(prev => ({
      ...prev,
      [field]: isValid
    }));
  };

  const handleApprove = async () => {
    if (!validateProject()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprove(editedProject);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    setIsSubmitting(true);
    try {
      await onReject(editedProject.id, reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Project, value: any) => {
    setEditedProject(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for the field if it exists
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Check if any tags are invalid
  const hasInvalidTags = !Object.values(validationStates).every(state => state);

  const complexityOptions = ['Basic', 'Intermediate', 'Advanced'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full bg-neutral-900 border border-neutral-700 overflow-y-auto max-h-[90vh] p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-bold">
            Review & Edit Project Details
          </DialogTitle>
        </DialogHeader>

        {hasInvalidTags && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md">
            <p className="text-red-400 text-sm">
              Please correct all tag validation errors before approving the project.
            </p>
          </div>
        )}

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-400">GitHub URL</label>
            <Input
              value={editedProject.githubUrl || ''}
              className="bg-neutral-800 border-neutral-700 text-white"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-400">Owner</label>
            <Input
              value={editedProject.owner || 'anonymous'}
              onChange={(e) => handleInputChange('owner', e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-400">
              Project Name
              {validationErrors.projectName && (
                <span className="text-red-400 ml-2 text-xs">{validationErrors.projectName}</span>
              )}
            </label>
            <Input
              placeholder="Project Name"
              value={editedProject.projectName || ''}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              className={`bg-neutral-800 border-neutral-700 text-white h-12 ${
                validationErrors.projectName ? 'border-red-500' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-400">
              Project Description
              {validationErrors.projectDescription && (
                <span className="text-red-400 ml-2 text-xs">{validationErrors.projectDescription}</span>
              )}
            </label>
            <Textarea
              placeholder="Project Description"
              value={editedProject.projectDescription || ''}
              onChange={(e) => handleInputChange('projectDescription', e.target.value)}
              className={`bg-neutral-800 border-neutral-700 text-white h-32 ${
                validationErrors.projectDescription ? 'border-red-500' : ''
              }`}
            />
          </div>

          <ValidatedArrayInput
            label="Programming Languages"
            value={editedProject.programmingLanguages || []}
            onChange={(value) => handleInputChange('programmingLanguages', value)}
            placeholder="Enter programming languages..."
            approvedTags={approvedTags?.programmingLanguages}
            onValidationChange={handleValidationChange('programmingLanguages')}
          />

          <ValidatedArrayInput
            label="Frameworks"
            value={editedProject.frameworks || []}
            onChange={(value) => handleInputChange('frameworks', value)}
            placeholder="Enter frameworks..."
            approvedTags={approvedTags?.frameworks}
            onValidationChange={handleValidationChange('frameworks')}
          />

          <ValidatedArrayInput
            label="Azure Services"
            value={editedProject.azureServices || []}
            onChange={(value) => handleInputChange('azureServices', value)}
            placeholder="Enter Azure services..."
            approvedTags={approvedTags?.azureServices}
            onValidationChange={handleValidationChange('azureServices')}
          />

          <ValidatedArrayInput
            label="Design Patterns"
            value={editedProject.designPatterns || []}
            onChange={(value) => handleInputChange('designPatterns', value)}
            placeholder="Enter design patterns..."
            approvedTags={approvedTags?.designPatterns}
            onValidationChange={handleValidationChange('designPatterns')}
          />

          <ValidatedArrayInput
            label="Industries"
            value={editedProject.industries || []}
            onChange={(value) => handleInputChange('industries', value)}
            placeholder="Enter industries..."
            approvedTags={approvedTags?.industries}
            onValidationChange={handleValidationChange('industries')}
            multiline={true}
          />

          <ArrayInput
            label="Customers"
            value={editedProject.customers || []}
            onChange={(value) => handleInputChange('customers', value)}
            placeholder="What customers have leveraged this repo?"
            multiline={true}
          />

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-400">
              Code Complexity
              {validationErrors.codeComplexity && (
                <span className="text-red-400 ml-2 text-xs">{validationErrors.codeComplexity}</span>
              )}
            </label>
            <div className="flex space-x-2">
              {complexityOptions.map((complexity) => (
                <Button
                  key={complexity}
                  variant={editedProject.codeComplexity === complexity ? 'accentGradient' : 'secondary'}
                  onClick={() => handleInputChange('codeComplexity', complexity)}
                  className={`flex-1 ${
                    validationErrors.codeComplexity ? 'border border-red-500' : ''
                  }`}
                >
                  {complexity}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-400">
              Business Value
              {validationErrors.businessValue && (
                <span className="text-red-400 ml-2 text-xs">{validationErrors.businessValue}</span>
              )}
            </label>
            <Textarea
              placeholder="Business Value"
              value={editedProject.businessValue || ''}
              onChange={(e) => handleInputChange('businessValue', e.target.value)}
              className={`bg-neutral-800 border-neutral-700 text-white h-32 ${
                validationErrors.businessValue ? 'border-red-500' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-400">
              Target Audience
              {validationErrors.targetAudience && (
                <span className="text-red-400 ml-2 text-xs">{validationErrors.targetAudience}</span>
              )}
            </label>
            <Textarea
              placeholder="Target Audience"
              value={editedProject.targetAudience || ''}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className={`bg-neutral-800 border-neutral-700 text-white h-32 ${
                validationErrors.targetAudience ? 'border-red-500' : ''
              }`}
            />
          </div>

          <div className="flex space-x-2 mt-4">
            <Button
              onClick={handleApprove}
              disabled={isSubmitting || hasInvalidTags}
              className={`flex-1 ${
                hasInvalidTags 
                  ? 'bg-green-900/50 hover:bg-green-900/50 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500'
              } focus-visible:ring-green-400 text-white`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Approving...</span>
                </div>
              ) : (
                'Approve'
              )}
            </Button>
            <Button
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-500 focus-visible:ring-red-400 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Rejecting...</span>
                </div>
              ) : (
                'Reject'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminReviewDialog;