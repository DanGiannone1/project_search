// AddProjectDialogInitial.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AddProjectDialogInitialProps {
  githubUrl: string;
  setGithubUrl: React.Dispatch<React.SetStateAction<string>>;
  isSubmittingRepo: boolean;
  handleSubmitRepo: () => Promise<void>;
  handleClose: () => void;
  error: string | null;
}

const AddProjectDialogInitial: React.FC<AddProjectDialogInitialProps> = ({
  githubUrl,
  setGithubUrl,
  isSubmittingRepo,
  handleSubmitRepo,
  handleClose,
  error
}) => {
  return (
    <div className="space-y-4 mt-4">
      <Input
        placeholder="GitHub repository URL..."
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
        className="bg-neutral-800 border-neutral-700 text-white"
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      <Button
        className="w-full"
        onClick={handleSubmitRepo}
        disabled={!githubUrl.trim() || isSubmittingRepo}
        variant="accentGradient"
      >
        {isSubmittingRepo ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <span>Submit Repository</span>
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

export default AddProjectDialogInitial;
