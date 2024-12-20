import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Loader2, Filter } from 'lucide-react';

interface SearchCardProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  isSearching: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const SearchCard: React.FC<SearchCardProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <div className="relative">
      <Textarea
        placeholder="Describe the project you're looking for..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full text-lg bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 text-white pr-24 h-14 resize-none rounded-xl shadow-lg focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
      />
      <div className="absolute right-3 bottom-3 flex gap-2">
        <Button
          onClick={onToggleFilters}
          size="icon"
          variant="ghost" 
          className={`h-8 w-8 rounded-full focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none transition-all duration-200 ${
            showFilters 
              ? 'bg-violet-500/10 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
              : 'text-gray-400 hover:bg-violet-500/10 hover:text-violet-400'
          }`}
        >
          <Filter className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          size="icon"
          className="h-8 w-8 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <ArrowRight className="w-4 h-4 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchCard;