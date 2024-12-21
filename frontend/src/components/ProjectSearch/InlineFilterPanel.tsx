import React from 'react';
import { Filters, AvailableOptions } from './types';
import { Code2, Box, Layers, LayoutTemplate, Activity, Cloud, Globe, Filter } from 'lucide-react';

interface InlineFilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  availableOptions: AvailableOptions;
}

interface CategoryStyle {
  label: string;
  headerColor: string;
  icon: JSX.Element;
  selectedBg: string;
  bgHover: string;
  subHeaderColor?: string;
}

type CategoryStylesType = {
  [K in keyof Filters]: CategoryStyle;
};

const categoryStyles: CategoryStylesType = {
  programmingLanguages: {
    label: 'Programming Languages',
    headerColor: 'text-red-400',
    icon: <Code2 className="w-4 h-4" />,
    selectedBg: 'bg-red-900/50 text-gray-300',
    bgHover: 'hover:bg-red-900/30'
  },
  frameworks: {
    label: 'Frameworks',
    headerColor: 'text-green-400',
    icon: <Box className="w-4 h-4" />,
    selectedBg: 'bg-green-900/50 text-gray-300',
    bgHover: 'hover:bg-green-900/30'
  },
  azureServices: {
    label: 'Azure Services',
    headerColor: 'text-blue-400',
    icon: <Cloud className="w-4 h-4" />,
    selectedBg: 'bg-blue-900/50 text-gray-300',
    bgHover: 'hover:bg-blue-900/30',
    subHeaderColor: 'text-blue-300'
  },
  designPatterns: {
    label: 'Design Patterns',
    headerColor: 'text-yellow-400',
    icon: <LayoutTemplate className="w-4 h-4" />,
    selectedBg: 'bg-yellow-900/50 text-gray-300',
    bgHover: 'hover:bg-yellow-900/30'
  },
  projectTypes: {
    label: 'Project Type',
    headerColor: 'text-cyan-400',
    icon: <Layers className="w-4 h-4" />,
    selectedBg: 'bg-cyan-900/50 text-gray-300',
    bgHover: 'hover:bg-cyan-900/30'
  },
  codeComplexities: {
    label: 'Code Complexity',
    headerColor: 'text-orange-400',
    icon: <Activity className="w-4 h-4" />,
    selectedBg: 'bg-orange-800/60 text-gray-200',
    bgHover: 'hover:bg-orange-900/30'
  },
  industries: {
    label: 'Industries',
    headerColor: 'text-pink-400',
    icon: <Globe className="w-4 h-4" />,
    selectedBg: 'bg-pink-900/50 text-gray-300',
    bgHover: 'hover:bg-pink-900/30'
  },
};

const InlineFilterPanel: React.FC<InlineFilterPanelProps> = ({
  filters,
  setFilters,
  availableOptions
}) => {
  // Group Azure services by category for display
  const groupedAzureServices = React.useMemo(() => {
    const grouped: { [category: string]: string[] } = {
      'AI': [],
      'Data': [],
      'Application': []
    };
    
    // For each service, look up its category and add it to the appropriate group
    availableOptions.azureServices.forEach(service => {
      const category = availableOptions.azureServiceCategories[service];
      if (category && grouped[category]) {
        grouped[category].push(service);
      }
    });

    // Sort services within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort();
    });

    return grouped;
  }, [availableOptions.azureServices, availableOptions.azureServiceCategories]);

  const topLevelCategories = [
    { key: 'programmingLanguages', items: availableOptions.programmingLanguages },
    { key: 'frameworks', items: availableOptions.frameworks },
    { key: 'projectTypes', items: availableOptions.projectTypes },
    { key: 'designPatterns', items: availableOptions.designPatterns },
    { key: 'codeComplexities', items: availableOptions.codeComplexities },
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

  const renderFilterButton = (item: string, key: keyof Filters, style: CategoryStyle) => {
    const isSelected = filters[key].includes(item);
    const unselectedClass = 'bg-neutral-800/80 text-gray-400';
    const appliedClass = isSelected ? style.selectedBg : unselectedClass;
    
    return (
      <button
        key={item}
        onClick={() => toggleFilter(key, item)}
        className={`${appliedClass} ${!isSelected && style.bgHover} px-2 py-1 rounded-md text-xs transition-all duration-150 hover:opacity-90 focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none`}
        aria-label={`Filter by ${item}`}
        type="button"
      >
        {item}
      </button>
    );
  };

  const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="relative">
      {/* Filter Header */}
      <div className="absolute -top-8 left-3 flex items-center gap-2">
        <Filter className="w-5 h-5 text-violet-400" />
        <span className="text-sm text-gray-300 font-medium">Filter Results</span>
        {activeFilterCount > 0 && (
          <span className="text-sm text-violet-400 ml-2">
            {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Main Filter Panel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-4">
        {/* Top Level Categories Grid */}
        <div className="grid grid-cols-3 gap-x-12 gap-y-8 mb-8">
          {topLevelCategories.map(({ key, items }) => {
            const style = categoryStyles[key as keyof Filters];
            return (
              <div key={key} className="flex flex-col gap-3">
                <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${style.headerColor}`}>
                  {style.icon}
                  <span>{style.label}</span>
                </h3>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {items.length > 0 ? (
                    items.map(item => renderFilterButton(item, key as keyof Filters, style))
                  ) : (
                    <span className="px-2 py-1 bg-neutral-800/50 text-gray-500 text-xs rounded-md">
                      No options available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Azure Services Section Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-neutral-900 px-4 text-sm font-medium text-blue-400">
              Azure Services
            </span>
          </div>
        </div>

        {/* Azure Services Categories Grid */}
        <div className="grid grid-cols-3 gap-12">
          {Object.entries(groupedAzureServices).map(([category, services]) => (
            <div key={category} className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-blue-300 uppercase tracking-wider">
                {category}
              </h4>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {services.length > 0 ? (
                  services.map(service => 
                    renderFilterButton(service, 'azureServices', categoryStyles.azureServices)
                  )
                ) : (
                  <span className="px-2 py-1 bg-neutral-800/50 text-gray-500 text-xs rounded-md">
                    No services available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InlineFilterPanel;