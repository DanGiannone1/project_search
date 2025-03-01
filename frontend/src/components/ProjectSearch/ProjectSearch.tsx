// ProjectSearch.tsx
import { useState, useEffect } from 'react';
import SearchCard from './SearchCard';
import ResultsDisplay from './ResultsDisplay';
import { Project, Filters, AvailableOptions } from './types';
import InlineFilterPanel from './InlineFilterPanel';

function ProjectSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const [filters, setFilters] = useState<Filters>({
    programmingLanguages: [],
    frameworks: [],
    azureServices: [],
    designPatterns: [],
    industries: [],
    projectTypes: [],
    codeComplexities: [],
    customers: []
  });

  const [availableOptions, setAvailableOptions] = useState<AvailableOptions>({
    programmingLanguages: [],
    frameworks: [],
    azureServices: [],
    azureServiceCategories: {},
    designPatterns: [],
    industries: [],
    projectTypes: [],
    codeComplexities: [],
    customers: []
  });

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Fetch filter options and all projects on component mount
  useEffect(() => {
    async function initialize() {
      try {
        // Fetch filter options
        const optionsRes = await fetch(`${apiUrl}/api/get_filter_options`);
        if (!optionsRes.ok) {
          throw new Error('Failed to fetch filter options');
        }
        const optionsData = await optionsRes.json();
        setAvailableOptions(optionsData);
        
        // Fetch all projects
        const projectsRes = await fetch(`${apiUrl}/api/list_projects`);
        if (!projectsRes.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData = await projectsRes.json();
        setResults(projectsData.results);
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [apiUrl]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`${apiUrl}/api/search_projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filters: filters,
          sort: ''
        }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error searching projects:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white">
      <div className="flex flex-col items-center pt-16 px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500 mb-4">
          Project Search
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl text-center mb-8">
          Discover similar projects using natural language search powered by AI
        </p>

        <div className="max-w-4xl w-full">
          <SearchCard
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isSearching={isSearching}
            showFilters={showFilterPanel}
            onToggleFilters={() => setShowFilterPanel(!showFilterPanel)}
          />
        </div>
      </div>

      <div className="px-6 mt-8">
        {showFilterPanel && (
          <div className="animate-in slide-in-from-top-4 duration-200">
            <InlineFilterPanel
              filters={filters}
              setFilters={setFilters}
              availableOptions={availableOptions}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center mt-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="mt-8">
            <ResultsDisplay results={results} />
          </div>
        ) : (
          <div className="text-center mt-16 text-gray-400">
            <p>No projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectSearch;