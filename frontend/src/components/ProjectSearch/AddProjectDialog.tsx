// frontend/src/components/ProjectSearch/AddProjectDialog.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Project } from './types';
import { toCamelCase } from '@/lib/convertKeys';
import { toast } from 'react-toastify';
import AddProjectDialogInitial from './AddProjectDialogInitial';
import AddProjectDialogReview from './AddProjectDialogReview';

const AddProjectDialog: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [githubUrl, setGithubUrl] = useState('');
    const [isSubmittingRepo, setIsSubmittingRepo] = useState(false);
    const [extractedData, setExtractedData] = useState<Project | null>(null);
    const [isSubmittingProject, setIsSubmittingProject] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiUrl = import.meta.env.VITE_API_URL || '';

    const handleSubmitRepo = async () => {
        if (!githubUrl.trim()) return;
        setIsSubmittingRepo(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/api/submit_repo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch repository data.');
            }

            const data = await response.json();
            const camelData: Project = toCamelCase(data);

            // Attach the githubUrl since the LLM doesn't return it
            camelData.githubUrl = githubUrl;

            setExtractedData(camelData);
        } catch (err: any) {
            console.error('Error submitting repository:', err);
            setError(err.message || 'An unexpected error occurred.');
            toast.error(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmittingRepo(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!extractedData) return;
        setIsSubmittingProject(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/api/send_for_review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(extractedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send for review.');
            }

            setOpen(false);
            setGithubUrl('');
            setExtractedData(null);
            toast.success('Project sent for review successfully!');
        } catch (err: any) {
            console.error('Error sending for review:', err);
            setError(err.message || 'An unexpected error occurred.');
            toast.error(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmittingProject(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setGithubUrl('');
        setExtractedData(null);
        setError(null);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
          <Button 
            onClick={() => setOpen(true)} // Add this line
            variant="secondary" 
            size="sm"
            className="h-9 px-4 whitespace-nowrap"
          >
            + Add Your Project
          </Button>
            <DialogContent
                className={extractedData ? 
                    "max-w-2xl w-full bg-neutral-900 border border-neutral-700 overflow-y-auto max-h-[90vh] p-6 rounded-lg" :
                    "max-w-md w-full bg-neutral-900 border border-neutral-700 overflow-y-auto max-h-[80vh] p-6 rounded-lg"
                }
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-lg font-bold">
                        {extractedData ? 'Review & Edit Project Details' : 'Add New Project'}
                    </DialogTitle>
                </DialogHeader>

                {!extractedData ? (
                    <AddProjectDialogInitial
                        githubUrl={githubUrl}
                        setGithubUrl={setGithubUrl}
                        isSubmittingRepo={isSubmittingRepo}
                        handleSubmitRepo={handleSubmitRepo}
                        handleClose={handleClose}
                        error={error}
                    />
                ) : (
                    <AddProjectDialogReview
                        extractedData={extractedData}
                        setExtractedData={setExtractedData}
                        error={error}
                        isSubmittingProject={isSubmittingProject}
                        handleFinalSubmit={handleFinalSubmit}
                        handleClose={handleClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddProjectDialog;
