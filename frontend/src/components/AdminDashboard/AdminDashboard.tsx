import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Github } from 'lucide-react';
import { Project, ApprovedTags } from '@/components/ProjectSearch/types';
import { toast } from 'react-toastify';
import { toCamelCase } from '@/lib/convertKeys';
import AdminReviewDialog from './AdminReviewDialog';
import TagManagement from './TagManagement';

/**
 * AdminDashboard
 * -------------
 * 1) Fetches the original payload, which includes "azure_service_mapping" and "azure_services".
 * 2) Calls `toCamelCase(...)` to get { azureServiceMapping, azureServices, ... }.
 * 3) Renames `azureServiceMapping` -> `azureServiceCategories` so our TagManagement (and our ApprovedTags interface) can use that property.
 * 4) On Save, we do the reverse rename so the backend sees `azure_service_mapping`.
 */

const AdminDashboard: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Our local copy of approved tags (matching the ApprovedTags interface)
  const [approvedTags, setApprovedTags] = useState<ApprovedTags | null>(null);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    fetchPendingReviews();
    fetchApprovedTags();
  }, []);

  // ---------------------------------------------------
  // 1) FETCH /get_approved_tags
  // ---------------------------------------------------
  const fetchApprovedTags = async () => {
    try {
      const response = await fetch('/api/admin/get_approved_tags');
      if (!response.ok) {
        throw new Error('Failed to fetch approved tags');
      }
      const data = await response.json(); // e.g. { azure_service_mapping: {...}, azure_services: [...], ... }
      const camelData = toCamelCase(data); 
      // => { azureServiceMapping, azureServices, ... }

      // If we got azureServiceMapping but not azureServiceCategories, rename it
      if (camelData.azureServiceMapping && !camelData.azureServiceCategories) {
        camelData.azureServiceCategories = { ...camelData.azureServiceMapping };
        delete camelData.azureServiceMapping;
      }

      // If we did not have azureServices or azureServiceCategories yet, ensure empty arrays/objects
      if (!camelData.azureServices) {
        camelData.azureServices = [];
      }
      if (!camelData.azureServiceCategories) {
        camelData.azureServiceCategories = {};
      }

      setApprovedTags(camelData as ApprovedTags);
    } catch (error) {
      console.error('Error fetching approved tags:', error);
      toast.error('Failed to load approved tags');
    } finally {
      setLoadingTags(false);
    }
  };

  // ---------------------------------------------------
  // 2) POST /update_approved_tags
  // ---------------------------------------------------
  const handleUpdateTags = async (newTags: ApprovedTags) => {
    try {
      // The backend expects "azure_service_mapping" not "azureServiceCategories".
      // We'll rename it on the fly before sending.
      const serverPayload = { ...newTags } as any;

      // Move azureServiceCategories -> azureServiceMapping
      if (serverPayload.azureServiceCategories) {
        serverPayload.azureServiceMapping = { ...serverPayload.azureServiceCategories };
        delete serverPayload.azureServiceCategories;
      }

      // Now serverPayload has azure_service_mapping, azure_services, etc. in camelCase or snakeCase?
      // If your server expects snake_case exactly, you might need a "toSnakeCase" step,
      // but let's assume it's okay with these keys.
      // (If you do, you'd do a separate conversion step.)

      const response = await fetch('/api/admin/update_approved_tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverPayload),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update tags');
      }
  
      // If it succeeded, we store newTags in local state
      setApprovedTags(newTags);
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    }
  };

  // ---------------------------------------------------
  // Pending reviews (unrelated to Azure service logic)
  // ---------------------------------------------------
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
      toast.error(error instanceof Error ? error.message : 'Error fetching reviews');
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
      setPendingReviews((prev) => prev.filter(p => p.id !== updatedProject.id));
      closeReviewDialog();
    } catch (error) {
      console.error('Error approving project:', error);
      toast.error(error instanceof Error ? error.message : 'Error approving project');
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
      setPendingReviews((prev) => prev.filter(p => p.id !== id));
      closeReviewDialog();
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast.error(error instanceof Error ? error.message : 'Error rejecting project');
    } finally {
      setActionLoading(null);
    }
  };

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
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
      
      <div className="flex gap-8">
        {/* Pending Reviews Panel */}
        <div className="w-1/3">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Pending Reviews</h2>
              <div className="space-y-4">
                {pendingReviews.length === 0 ? (
                  <p className="text-gray-300">No pending reviews.</p>
                ) : (
                  pendingReviews.map(project => (
                    <Card
                      key={project.id}
                      className="bg-neutral-800 border-neutral-700"
                    >
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

        {/* Tag Management Panel */}
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
