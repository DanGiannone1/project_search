// ProjectSearch.tsx
import { useState } from 'react';

import FilterSidebar from './FilterSidebar';
import SearchCard from './SearchCard';
import ResultsDisplay from './ResultsDisplay';
import { Project, Filters, SortOption } from './types';

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

  return (
    <div className="w-screen h-screen flex bg-transparent text-white overflow-hidden">
      {/* Left Filter/Sort Pane - Added h-screen */}
      <div className="h-screen flex-shrink-0">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          sortOptions={sortOptions}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-16"> {/* Added pt-16 to account for buttons */}
        <div className="px-6 py-8">
          <div className="text-center space-y-4 mb-8">
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
          />

          {/* Results Display */}
          {results.length > 0 && <ResultsDisplay results={results} />}
        </div>
      </div>
    </div>
  );
}

export default ProjectSearch;
