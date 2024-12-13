// AddProjectDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { ProjectFormData } from './types';

interface AddProjectDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uploadFormData: ProjectFormData;
  setUploadFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  handleSubmitProject: () => void;
  isSubmittingProject: boolean;
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({
  open,
  setOpen,
  uploadFormData,
  setUploadFormData,
  handleSubmitProject,
  isSubmittingProject,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accentGradient" size="lg" className="h-12">
          <Plus className="w-5 h-5 mr-2" />
          Add Your Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-neutral-900 border border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Project name..."
            value={uploadFormData.projectName}
            onChange={(e) =>
              setUploadFormData({
                ...uploadFormData,
                projectName: e.target.value,
              })
            }
            className="bg-neutral-800 border-neutral-700 text-white"
          />
          <Textarea
            placeholder="Project description..."
            value={uploadFormData.description}
            onChange={(e) =>
              setUploadFormData({
                ...uploadFormData,
                description: e.target.value,
              })
            }
            className="bg-neutral-800 border-neutral-700 text-white"
          />
          <Input
            placeholder="GitHub repository URL..."
            value={uploadFormData.githubUrl}
            onChange={(e) =>
              setUploadFormData({
                ...uploadFormData,
                githubUrl: e.target.value,
              })
            }
            className="bg-neutral-800 border-neutral-700 text-white"
          />
          <Button
            className="w-full"
            onClick={handleSubmitProject}
            disabled={
              !uploadFormData.description ||
              !uploadFormData.githubUrl ||
              !uploadFormData.projectName ||
              isSubmittingProject
            }
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
