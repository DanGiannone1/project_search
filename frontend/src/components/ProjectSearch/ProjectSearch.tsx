// frontend/src/components/ProjectSearch/ProjectSearch.tsx
import { useState, useEffect } from 'react';
import SearchCard from './SearchCard';
import ResultsDisplay from './ResultsDisplay';
import { Project, Filters } from './types';
import InlineFilterPanel from './InlineFilterPanel';

function ProjectSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    programmingLanguages: [],
    frameworks: [],
    azureServices: [],
    designPatterns: [],
    industries: [],
    projectTypes: [],
    codeComplexities: []
  });

  const [availableOptions, setAvailableOptions] = useState({
    programmingLanguages: [],
    frameworks: [],
    azureServices: [],
    designPatterns: [],
    industries: [],
    projectTypes: [],
    codeComplexities: []
  });

  const [serviceMapping, setServiceMapping] = useState<{
    [key: string]: string[];
  }>({
    'AI & ML': [],
    'Data': [],
    'Application': []
  });

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const res = await fetch('/api/get_filter_options');
        if (!res.ok) {
          throw new Error('Failed to fetch filter options');
        }
        const data = await res.json();
        setAvailableOptions(data);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    }

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    async function fetchServiceMapping() {
      try {
        const res = await fetch('/api/get_service_mapping');
        if (!res.ok) {
          throw new Error('Failed to fetch service mapping');
        }
        const data = await res.json();
        setServiceMapping(data);
      } catch (error) {
        console.error('Error fetching service mapping:', error);
      }
    }

    fetchServiceMapping();
  }, []);

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
          sort: '' // no sorting now
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
      {/* Header section with fixed width */}
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

      {/* Filter panel and results with full width */}
      <div className="px-6 mt-8">
        {showFilterPanel && (
          <div className="animate-in slide-in-from-top-4 duration-200">
            <InlineFilterPanel
              filters={filters}
              setFilters={setFilters}
              availableOptions={availableOptions}
              serviceMapping={serviceMapping} // Passed as prop
            />
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <ResultsDisplay results={results} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectSearch;
