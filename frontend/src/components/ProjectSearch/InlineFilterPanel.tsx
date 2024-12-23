import React, { useState, useEffect, useRef } from 'react';
import { Filters, AvailableOptions } from './types';
import { Code2, Box, Layers, LayoutTemplate, Activity, Cloud, Globe, Filter, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  customers: {
    label: 'Customers',
    headerColor: 'text-purple-400',
    icon: <Building2 className="w-4 h-4" />,
    selectedBg: 'bg-purple-900/50 text-gray-300',
    bgHover: 'hover:bg-purple-900/30'
  }
};

const InlineFilterPanel: React.FC<InlineFilterPanelProps> = ({
  filters,
  setFilters,
  availableOptions,
}) => {
  const [customerQuery, setCustomerQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCustomerQuery(query);
    
    if (!query.trim()) {
      setFilters(prev => ({ ...prev, customers: [] }));
    }
    
    if (query.trim()) {
      const filtered = availableOptions.customers
        .filter(customer => 
          customer.toLowerCase().includes(query.toLowerCase())
        );
      setFilteredCompanies(filtered);
      setIsDropdownOpen(true);
    } else {
      setFilteredCompanies([]);
      setIsDropdownOpen(false);
    }
  };

  const handleSelectCompany = (customer: string) => {
    setCustomerQuery(customer);
    setIsDropdownOpen(false);
    setFilters(prev => ({ ...prev, customers: [customer] }));
  };

  const groupedAzureServices = React.useMemo(() => {
    const grouped: { [category: string]: string[] } = {
      'AI': [],
      'Data': [],
      'Application': [],
      'Other': []
    };
    
    availableOptions.azureServices.forEach(service => {
      const category = availableOptions.azureServiceCategories[service];
      if (category && grouped[category]) {
        grouped[category].push(service);
      } else {
        // If no category is found or category doesn't match predefined ones, put in "Other"
        grouped['Other'].push(service);
      }
    });

    Object.keys(grouped).forEach(category => {
      grouped[category].sort();
    });

    return grouped;
  }, [availableOptions.azureServices, availableOptions.azureServiceCategories]);

  const topLevelCategories = [
    { key: 'programmingLanguages', items: availableOptions.programmingLanguages },
    { key: 'frameworks', items: availableOptions.frameworks },
    { key: 'projectTypes', items: availableOptions.projectTypes },
    { key: 'customers', items: filters.customers },
  ];

  const bottomCategories = [
    { key: 'codeComplexities', items: availableOptions.codeComplexities },
    { key: 'industries', items: availableOptions.industries },
    { key: 'designPatterns', items: availableOptions.designPatterns },
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
        if (categoryKey === 'customers') {
          return {
            ...prev,
            [categoryKey]: [value],
          };
        }
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
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-violet-400" />
          <span className="text-sm text-gray-300 font-medium">Filter Results</span>
          {activeFilterCount > 0 && (
            <span className="text-sm text-violet-400 ml-2">
              {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="grid grid-cols-4 gap-x-8 gap-y-8 mb-8">
          {topLevelCategories.map(({ key, items }) => {
            const style = categoryStyles[key as keyof Filters];
            return (
              <div key={key} className="flex flex-col gap-3">
                <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${style.headerColor}`}>
                  {style.icon}
                  <span>{style.label}</span>
                </h3>
                {key === 'customers' ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative" ref={dropdownRef}>
                      <Input
                        type="search"
                        placeholder="Search customers..."
                        value={customerQuery}
                        onChange={handleCustomerSearch}
                        onFocus={() => customerQuery && setIsDropdownOpen(true)}
                        className="h-8 w-48 bg-neutral-800/50 border-neutral-700/50 text-sm text-white placeholder:text-gray-400 focus:ring-violet-500/50 focus:border-violet-500/50"
                      />
                      
                      {isDropdownOpen && filteredCompanies.length > 0 && (
                        <div className="absolute w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-50">
                          {filteredCompanies.map(company => (
                            <button
                              key={company}
                              onClick={() => handleSelectCompany(company)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none"
                            >
                              {company}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                      {items.map(item => renderFilterButton(item, key as keyof Filters, style))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {items.length > 0 ? (
                      items.map(item => renderFilterButton(item, key as keyof Filters, style))
                    ) : (
                      <span className="px-2 py-1 bg-neutral-800/50 text-gray-500 text-xs rounded-md">
                        No options available
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-x-8 gap-y-8 mb-8">
          {bottomCategories.map(({ key, items }, index) => {
            const style = categoryStyles[key as keyof Filters];
            return (
              <div key={key} className={index === 2 ? "col-span-2" : ""}>
                <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${style.headerColor}`}>
                  {style.icon}
                  <span>{style.label}</span>
                </h3>
                <div className="flex flex-wrap gap-1.5 min-h-[32px] mt-3">
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

        <div className="grid grid-cols-4 gap-8">
          {Object.entries(groupedAzureServices).map(([category, services]) => {
            // Skip if category is "Other" - we'll handle it separately
            if (category === "Other") return null;
            return (
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
            );
          })}
          {/* Other category */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-medium text-blue-300 uppercase tracking-wider">
              Other
            </h4>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {groupedAzureServices["Other"] && groupedAzureServices["Other"].length > 0 ? (
                groupedAzureServices["Other"].map(service => 
                  renderFilterButton(service, 'azureServices', categoryStyles.azureServices)
                )
              ) : (
                <span className="px-2 py-1 bg-neutral-800/50 text-gray-500 text-xs rounded-md">
                  No services available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineFilterPanel;