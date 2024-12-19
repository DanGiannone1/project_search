// frontend/src/components/ProjectSearch/ProjectSearch.tsx

import { useState, useEffect } from 'react';
import FilterSidebar from './FilterSidebar';
import SearchCard from './SearchCard';
import ResultsDisplay from './ResultsDisplay';
import { Project, Filters } from './types';

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

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const res = await fetch('/api/get_filter_options');
        const data = await res.json();
        setAvailableOptions(data);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    }

    fetchFilterOptions();
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

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error searching projects:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-transparent text-white overflow-hidden">
      <div className="h-screen flex-shrink-0">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          availableOptions={availableOptions}
        />
      </div>
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="px-6 py-8">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">
              Project Search
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover similar projects using natural language search powered by AI
            </p>
          </div>
          <SearchCard
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isSearching={isSearching}
          />
          {results.length > 0 && <ResultsDisplay results={results} />}
        </div>
      </div>
    </div>
  );
}

export default ProjectSearch;
