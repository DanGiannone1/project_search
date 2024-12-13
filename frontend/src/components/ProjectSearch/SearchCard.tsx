// SearchCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, Loader2 } from 'lucide-react';
import AddProjectDialog from './AddProjectDialog';
import { ProjectFormData } from './types';

interface SearchCardProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  isSearching: boolean;
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uploadFormData: ProjectFormData;
  setUploadFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  handleSubmitProject: () => void;
  isSubmittingProject: boolean;
}

const SearchCard: React.FC<SearchCardProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  dialogOpen,
  setDialogOpen,
  uploadFormData,
  setUploadFormData,
  handleSubmitProject,
  isSubmittingProject,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 bg-neutral-900 shadow-xl hover:shadow-2xl transition-shadow">
        <CardContent className="p-6 space-y-6 relative">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Textarea
                placeholder="Describe the project you're looking for..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg bg-neutral-800 border border-neutral-700 text-white pr-12"
              />
            </div>
          </div>

          {/* Bottom row: Add Your Project centered, Search on the right */}
          <div className="relative flex items-center h-12 mt-4">
            {/* Center Add Your Project Button */}
            <div className="mx-auto">
              <AddProjectDialog
                open={dialogOpen}
                setOpen={setDialogOpen}
                uploadFormData={uploadFormData}
                setUploadFormData={setUploadFormData}
                handleSubmitProject={handleSubmitProject}
                isSubmittingProject={isSubmittingProject}
              />
            </div>

            {/* Search button smaller and on the bottom-right */}
            <div className="absolute right-0">
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                variant="accentGradient"
                size="sm"
                className="h-9"
              >
                {isSearching ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchCard;
