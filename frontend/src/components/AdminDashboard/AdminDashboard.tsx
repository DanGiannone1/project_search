import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Github } from 'lucide-react';
import { Project, ApprovedTags } from '@/components/ProjectSearch/types';
import { toast } from 'react-toastify';
import { toCamelCase } from '@/lib/convertKeys';
import AdminReviewDialog from './AdminReviewDialog';
import TagManagement from './TagManagement';

const AdminDashboard: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvedTags, setApprovedTags] = useState<ApprovedTags | null>(null);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    fetchPendingReviews();
    fetchApprovedTags();
  }, []);

  const fetchApprovedTags = async () => {
    try {
      const response = await fetch('/api/admin/get_approved_tags');
      if (!response.ok) {
        throw new Error('Failed to fetch approved tags');
      }
      const data = await response.json();
      setApprovedTags(toCamelCase(data));
    } catch (error) {
      console.error('Error fetching approved tags:', error);
      toast.error('Failed to load approved tags');
    } finally {
      setLoadingTags(false);
    }
  };

  const handleUpdateTags = async (newTags: ApprovedTags) => {
    try {
      const response = await fetch('/api/admin/update_approved_tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTags),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update tags');
      }
  
      // Directly update the local state instead of fetching
      setApprovedTags(newTags);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/get_pending_reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch pending reviews');
      }
      const data = await response.json();
      const camelData = Array.isArray(data) ? toCamelCase(data) : [];
      setPendingReviews(camelData);
    } catch (error) {
      console.error('Error in fetchPendingReviews:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while fetching reviews');
      }
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
        throw new Error(errorData.error || 'Failed to approve project');
      }

      toast.success('Project approved successfully');
      setPendingReviews(pendingReviews.filter(project => project.id !== updatedProject.id));
      closeReviewDialog();
    } catch (error) {
      console.error('Error approving project:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while approving the project');
      }
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
        throw new Error(errorData.error || 'Failed to reject project');
      }

      toast.success('Project rejected successfully');
      setPendingReviews(pendingReviews.filter(project => project.id !== id));
      closeReviewDialog();
    } catch (error) {
      console.error('Error rejecting project:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while rejecting the project');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || loadingTags) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-900 min-h-screen">
      <h1 className="text-2xl font-bold text-indigo-400 mb-6">Admin Dashboard</h1>
      
      <div className="flex gap-8"> {/* Increased gap from 6 to 8 */}
        {/* Pending Reviews */}
        <div className="w-1/3">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Pending Reviews</h2>
              <div className="space-y-4">
                {!pendingReviews || pendingReviews.length === 0 ? (
                  <p className="text-gray-300">No pending reviews.</p>
                ) : (
                  pendingReviews.map(project => (
                    <Card key={project.id} className="bg-neutral-800 border-neutral-700">
                      <CardContent className="p-4">
                        <CardTitle className="text-white text-base mb-2">
                          {project.projectName || 'No Name Provided'}
                        </CardTitle>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-indigo-400 hover:underline text-sm mb-3"
                        >
                          <Github className="w-4 h-4" />
                          <span className="truncate">{project.githubUrl}</span>
                        </a>
                        <Button
                          onClick={() => openReviewDialog(project)}
                          variant="accentGradient"
                          size="sm"
                          disabled={actionLoading === project.id}
                          className="w-32" 
                        >
                          Review
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tag Management */}
        <div className="flex-1">
          {approvedTags && (
            <TagManagement
              approvedTags={approvedTags}
              onUpdateTags={handleUpdateTags}
            />
          )}
        </div>
      </div>

      {selectedProject && (
        <AdminReviewDialog
          isOpen={isDialogOpen}
          onClose={closeReviewDialog}
          project={selectedProject}
          onApprove={handleApprove}
          onReject={handleReject}
          approvedTags={approvedTags}
        />
      )}
    </div>
  );
};

export default AdminDashboard;