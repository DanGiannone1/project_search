import React from 'react';
import { Filters } from './types';
import { Code2, Box, Layers, LayoutTemplate, Activity, Cloud, Globe, Filter } from 'lucide-react';

interface InlineFilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  availableOptions: {
    programmingLanguages: string[];
    frameworks: string[];
    azureServices: string[];
    designPatterns: string[];
    industries: string[];
    projectTypes: string[];
    codeComplexities: string[];
  };
}

// Each category matches the icon, color, and label as displayed in the ResultsDisplay project card
const categoryStyles: Record<string, {
  label: string;
  headerColor: string;
  icon: JSX.Element;
  selectedBg: string;
}> = {
  programmingLanguages: {
    label: 'Programming Languages',
    headerColor: 'text-red-400',
    icon: <Code2 className="w-4 h-4" />,
    selectedBg: 'bg-red-900/50 text-gray-300',
  },
  frameworks: {
    label: 'Frameworks',
    headerColor: 'text-green-400',
    icon: <Box className="w-4 h-4" />,
    selectedBg: 'bg-green-900/50 text-gray-300',
  },
  azureServices: {
    label: 'Azure Services',
    headerColor: 'text-blue-400',
    icon: <Cloud className="w-4 h-4" />,
    selectedBg: 'bg-blue-900/50 text-gray-300',
  },
  designPatterns: {
    label: 'Design Patterns',
    headerColor: 'text-yellow-400',
    icon: <LayoutTemplate className="w-4 h-4" />,
    selectedBg: 'bg-yellow-900/50 text-gray-300',
  },
  projectTypes: {
    label: 'Project Type',
    headerColor: 'text-cyan-400',
    icon: <Layers className="w-4 h-4" />,
    selectedBg: 'bg-cyan-900/50 text-gray-300',
  },
  codeComplexities: {
    label: 'Code Complexity',
    headerColor: 'text-orange-400',
    icon: <Activity className="w-4 h-4" />,
    selectedBg: 'bg-orange-800/60 text-gray-200',
  },
  industries: {
    label: 'Industries',
    headerColor: 'text-pink-400',
    icon: <Globe className="w-4 h-4" />,
    selectedBg: 'bg-pink-900/50 text-gray-300',
  },
};

const InlineFilterPanel: React.FC<InlineFilterPanelProps> = ({
  filters,
  setFilters,
  availableOptions
}) => {
  // Categories in same order as project cards
  const categories = [
    { key: 'programmingLanguages', items: availableOptions.programmingLanguages },
    { key: 'frameworks', items: availableOptions.frameworks },
    { key: 'projectTypes', items: availableOptions.projectTypes },
    { key: 'designPatterns', items: availableOptions.designPatterns },
    { key: 'codeComplexities', items: availableOptions.codeComplexities },
    { key: 'azureServices', items: availableOptions.azureServices },
    { key: 'industries', items: availableOptions.industries },
  ];

  const toggleFilter = (categoryKey: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[categoryKey];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [categoryKey]: currentValues.filter(v => v !== value),
        };
      } else {
        return {
          ...prev,
          [categoryKey]: [...currentValues, value],
        };
      }
    });
  };

  const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="relative">
      {/* Floating header */}
      <div className="absolute -top-8 left-3 flex items-center gap-2">
        <Filter className="w-5 h-5 text-violet-400" />
        <span className="text-sm text-gray-300 font-medium">Filter Results</span>
        {activeFilterCount > 0 && (
          <span className="text-sm text-violet-400 ml-2">
            {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Main filter panel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 mb-4">
        <div className="flex flex-wrap items-start gap-8">
          {categories.map(({ key, items }) => {
            const style = categoryStyles[key];

            return (
              <div key={key} className="flex flex-col gap-2 min-w-[200px]">
                <h3 className={`text-sm font-semibold flex items-center gap-1 ${style.headerColor}`}>
                  {style.icon}
                  <span>{style.label}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.length > 0 ? (
                    items.map(item => {
                      const isSelected = filters[key as keyof Filters].includes(item);
                      const unselectedClass = 'bg-neutral-800 text-gray-400';
                      const appliedClass = isSelected ? style.selectedBg : unselectedClass;
                      return (
                        <button
                          key={item}
                          onClick={() => toggleFilter(key as keyof Filters, item)}
                          className={`${appliedClass} px-2 py-1 rounded-md text-xs hover:opacity-80 transition-opacity focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none`}
                        >
                          {item}
                        </button>
                      );
                    })
                  ) : (
                    <span className="px-2 py-1 bg-neutral-800/50 text-gray-500 text-xs rounded-md">No options available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InlineFilterPanel;