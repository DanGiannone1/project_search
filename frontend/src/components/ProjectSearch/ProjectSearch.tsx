// ProjectSearch.tsx
import { useState } from 'react';

import FilterSidebar from './FilterSidebar';
import SearchCard from './SearchCard';
import ResultsDisplay from './ResultsDisplay';
import { Project, ProjectFormData, Filters, SortOption } from './types';

const sortOptions: SortOption[] = [
  { value: 'complexity_asc', label: 'Code Complexity: Low to High' },
  { value: 'complexity_desc', label: 'Code Complexity: High to Low' },
  { value: 'reusability_asc', label: 'Reusability: Low to High' },
  { value: 'reusability_desc', label: 'Reusability: High to Low' },
];

function ProjectSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadFormData, setUploadFormData] = useState<ProjectFormData>({
    projectName: '',
    description: '',
    githubUrl: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    programmingLanguages: [],
    frameworks: [],
    azureServices: [],
    designPatterns: [],
    industries: [],
    projectTypes: [],
  });

  // Sort state
  const [selectedSort, setSelectedSort] = useState<string>('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch('/api/search_projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filters: filters,
          sort: selectedSort,
        }),
      });

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error searching projects:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitProject = async () => {
    setIsSubmittingProject(true);
    try {
      const response = await fetch('/api/add_project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadFormData),
      });

      if (response.ok) {
        setUploadFormData({ projectName: '', description: '', githubUrl: '' });
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Left Filter/Sort Pane */}
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="text-center space-y-4 py-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
            Project Search
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover similar projects using natural language search powered by AI
          </p>
        </div>

        {/* Search Card */}
        <SearchCard
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isSearching={isSearching}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          uploadFormData={uploadFormData}
          setUploadFormData={setUploadFormData}
          handleSubmitProject={handleSubmitProject}
          isSubmittingProject={isSubmittingProject}
        />

        {/* Results Display */}
        {results.length > 0 && <ResultsDisplay results={results} />}
      </div>
    </div>
  );
}

export default ProjectSearch;
