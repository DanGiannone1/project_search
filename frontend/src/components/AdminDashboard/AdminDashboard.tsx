// frontend/src/components/AdminDashboard/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Github } from 'lucide-react';
import { Project } from '@/components/ProjectSearch/types';
import { toast } from 'react-toastify';
import { toCamelCase } from '@/lib/convertKeys';
import AdminReviewDialog from './AdminReviewDialog';

const AdminDashboard: React.FC = () => {
    const [pendingReviews, setPendingReviews] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        setLoading(true);
        try {
            console.log('Fetching pending reviews...');
            const response = await fetch('/api/admin/get_pending_reviews', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending reviews.');
            }

            const data = await response.json();
            console.log('Raw API response:', data);

            const camelData = Array.isArray(data) ? toCamelCase(data) : [];
            console.log('Transformed data:', camelData);

            setPendingReviews(camelData);
        } catch (error: any) {
            console.error('Error in fetchPendingReviews:', error);
            toast.error(error.message || 'An error occurred while fetching reviews.');
        } finally {
            setLoading(false);
        }
    };

    const openReviewDialog = (project: Project) => {
        setSelectedProject(project);
        setIsDialogOpen(true);
    };

    const closeReviewDialog = () => {
        setSelectedProject(null);
        setIsDialogOpen(false);
    };

    const handleApprove = async (updatedProject: Project) => {
        setActionLoading(updatedProject.id);
        try {
            const response = await fetch('/api/admin/approve_project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProject),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to approve project.');
            }

            toast.success('Project approved successfully.');
            setPendingReviews(pendingReviews.filter(project => project.id !== updatedProject.id));
            closeReviewDialog();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'An error occurred while approving the project.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string, reason: string) => {
        setActionLoading(id);
        try {
            const response = await fetch('/api/admin/reject_project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, reason }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reject project.');
            }

            toast.success('Project rejected successfully.');
            setPendingReviews(pendingReviews.filter(project => project.id !== id));
            closeReviewDialog();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'An error occurred while rejecting the project.');
        } finally {
            setActionLoading(null);
        }
    };

    console.log('Current pendingReviews state:', pendingReviews);
    console.log('Loading state:', loading);

    return (
        <div className="p-6 bg-neutral-900 min-h-screen">
            <h1 className="text-2xl font-bold text-indigo-400 mb-6">Admin Dashboard - Pending Reviews</h1>
            {loading ? (
                <div className="flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {!pendingReviews || pendingReviews.length === 0 ? (
                        <p className="text-gray-300">No pending reviews.</p>
                    ) : (
                        pendingReviews.map(project => (
                            <Card key={project.id} className="bg-neutral-800 border-neutral-700">
                                <CardContent className="pt-6">
                                    <CardTitle className="text-white font-semibold text-lg">
                                        {project.projectName || 'No Name Provided'}
                                    </CardTitle>
                                    <div className="flex items-center justify-between mt-2">
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 text-indigo-400 hover:underline"
                                        >
                                            <Github className="w-5 h-5" />
                                            <span>{project.githubUrl}</span>
                                        </a>
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            onClick={() => openReviewDialog(project)}
                                            variant="accentGradient"
                                            disabled={actionLoading === project.id}
                                        >
                                            Review
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {selectedProject && (
                <AdminReviewDialog
                    isOpen={isDialogOpen}
                    onClose={closeReviewDialog}
                    project={selectedProject}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default AdminDashboard;