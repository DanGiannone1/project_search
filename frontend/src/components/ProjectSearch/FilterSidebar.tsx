// frontend/src/components/ProjectSearch/FilterSidebar.tsx

import React from 'react';
import { Filters } from './types';

interface FilterSidebarProps {
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

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  availableOptions
}) => {

  const filterSections = [
    {
      title: 'Programming Language',
      items: availableOptions.programmingLanguages,
      selected: filters.programmingLanguages,
      setSelected: (vals: string[]) =>
        setFilters((prev) => ({ ...prev, programmingLanguages: vals })),
    },
    {
      title: 'Frameworks',
      items: availableOptions.frameworks,
      selected: filters.frameworks,
      setSelected: (vals: string[]) =>
        setFilters((prev) => ({ ...prev, frameworks: vals })),
    },
    {
      title: 'Azure Services',
      items: availableOptions.azureServices,
      selected: filters.azureServices,
      setSelected: (vals: string[]) =>
        setFilters((prev) => ({ ...prev, azureServices: vals })),
    },
    {
      title: 'Design Patterns',
      items: availableOptions.designPatterns,
      selected: filters.designPatterns,
      setSelected: (vals: string[]) =>
        setFilters((prev) => ({ ...prev, designPatterns: vals })),
    },
    {
      title: 'Industry',
      items: availableOptions.industries,
      selected: filters.industries,
      setSelected: (vals: string[]) =>
        setFilters((prev) => ({ ...prev, industries: vals })),
    },
    {
      title: 'Project Type',
      items: availableOptions.projectTypes,
      selected: filters.projectTypes,
      setSelected: (vals: string[]) =>
        setFilters((prev) => ({ ...prev, projectTypes: vals })),
    },
    {
      title: 'Code Complexity',
      items: availableOptions.codeComplexities,
      selected: filters.codeComplexities,
      setSelected: (vals: string[]) =>
        setFilters((prev) => ({ ...prev, codeComplexities: vals })),
    }
  ];

  const handleCheckboxChange = (
    value: string,
    selectedValues: string[],
    setFunction: (vals: string[]) => void
  ) => {
    if (selectedValues.includes(value)) {
      setFunction(selectedValues.filter((v) => v !== value));
    } else {
      setFunction([...selectedValues, value]);
    }
  };

  return (
    <div className="w-64 h-full bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 mb-4">
        Filter
      </h2>

      <div className="space-y-6 text-sm">
        {filterSections.map(({ title, items, selected, setSelected }) => (
          <div key={title}>
            <h3 className="font-semibold mb-2">{title}</h3>
            <div className="space-y-2 text-xs">
              {items.length > 0 ? items.map((item) => (
                <label key={item} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border border-neutral-700 bg-neutral-800"
                    checked={selected.includes(item)}
                    onChange={() => handleCheckboxChange(item, selected, setSelected)}
                  />
                  <span>{item}</span>
                </label>
              )) : (
                <p className="text-gray-500 text-xs">No options available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;
