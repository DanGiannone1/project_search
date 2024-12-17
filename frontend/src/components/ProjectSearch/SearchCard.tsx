// SearchCard.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Loader2 } from 'lucide-react';

interface SearchCardProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  isSearching: boolean;
}

const SearchCard: React.FC<SearchCardProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        <Textarea
          placeholder="Describe the project you're looking for..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-lg bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 text-white pr-12 h-14 resize-none rounded-xl shadow-lg focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          size="icon"
          className="absolute right-3 bottom-3 h-8 w-8 rounded-full bg-teal-500 hover:bg-teal-400 transition-colors p-0"
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