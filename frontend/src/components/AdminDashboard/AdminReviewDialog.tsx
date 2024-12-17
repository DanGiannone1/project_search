// frontend/src/components/AdminDashboard/AdminReviewDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Project } from '@/components/ProjectSearch/types';
import { Textarea} from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface AdminReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    onApprove: (updatedProject: Project) => void;
    onReject: (id: string, reason: string) => void;
}

const AdminReviewDialog: React.FC<AdminReviewDialogProps> = ({
    isOpen,
    onClose,
    project,
    onApprove,
    onReject
}) => {
    const [editedProject, setEditedProject] = useState<Project>({ ...project });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async () => {
        setIsSubmitting(true);
        await onApprove(editedProject);
        setIsSubmitting(false);
    };

    const handleReject = async () => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        setIsSubmitting(true);
        await onReject(editedProject.id, reason);
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-full bg-neutral-900 border border-neutral-700 overflow-y-auto max-h-[90vh] p-6 rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-white text-lg font-bold">
                        Review & Edit Project Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-indigo-400">GitHub URL</label>
                        <Input
                            value={editedProject.githubUrl || ''}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
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
                            value={project.owner || 'anonymous'}
                            className="bg-neutral-800 border-neutral-700 text-white h-12"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-indigo-400">Project Name</label>
                        <Input
                            placeholder="Project Name"
                            value={editedProject.projectName || ''}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
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
                            value={editedProject.projectDescription}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
                                    projectDescription: e.target.value,
                                })
                            }
                            className="bg-neutral-800 border-neutral-700 text-white h-32"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-indigo-400">Programming Languages (comma separated)</label>
                        <Input
                            placeholder="Programming Languages"
                            value={editedProject.programmingLanguages?.join(', ') || ''}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
                                    programmingLanguages: e.target.value.split(',').map(lang => lang.trim()),
                                })
                            }
                            className="bg-neutral-800 border-neutral-700 text-white h-12"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-indigo-400">Frameworks (comma separated)</label>
                        <Input
                            placeholder="Frameworks"
                            value={editedProject.frameworks?.join(', ') || ''}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
                                    frameworks: e.target.value.split(',').map(fw => fw.trim()),
                                })
                            }
                            className="bg-neutral-800 border-neutral-700 text-white h-12"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-indigo-400">Azure Services (comma separated)</label>
                        <Input
                            placeholder="Azure Services"
                            value={editedProject.azureServices?.join(', ') || ''}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
                                    azureServices: e.target.value.split(',').map(service => service.trim()),
                                })
                            }
                            className="bg-neutral-800 border-neutral-700 text-white h-12"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-indigo-400">Design Patterns (comma separated)</label>
                        <Input
                            placeholder="Design Patterns"
                            value={editedProject.designPatterns?.join(', ') || ''}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
                                    designPatterns: e.target.value.split(',').map(dp => dp.trim()),
                                })
                            }
                            className="bg-neutral-800 border-neutral-700 text-white h-12"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-indigo-400">Project Type</label>
                        <Input
                            placeholder="Project Type"
                            value={editedProject.projectType || ''}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
                                    projectType: e.target.value,
                                })
                            }
                            className="bg-neutral-800 border-neutral-700 text-white h-12"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-indigo-400">Code Complexity</label>
                        <div className="flex space-x-2">
                            {['Beginner', 'Intermediate', 'Advanced'].map((option) => (
                                <Button
                                    key={option}
                                    variant={editedProject.codeComplexity === option ? 'accentGradient' : 'secondary'}
                                    onClick={() =>
                                        setEditedProject({
                                            ...editedProject,
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
                            value={editedProject.businessValue}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
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
                            value={editedProject.targetAudience}
                            onChange={(e) =>
                                setEditedProject({
                                    ...editedProject,
                                    targetAudience: e.target.value,
                                })
                            }
                            className="bg-neutral-800 border-neutral-700 text-white h-32"
                        />
                    </div>

                    <div className="flex space-x-2 mt-4">
                        <Button
                            onClick={handleApprove}
                            disabled={isSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-500 focus-visible:ring-green-400 text-white"
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
