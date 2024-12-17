// frontend/src/components/ProjectSearch/FilterSidebar.tsx

import React from 'react';
import { Filters, SortOption } from './types';

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  sortOptions: SortOption[];
  selectedSort: string;
  setSelectedSort: React.Dispatch<React.SetStateAction<string>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  sortOptions,
  selectedSort,
  setSelectedSort,
}) => {
  const programmingLanguages = ['python', 'C#'];
  const frameworks = ['semantic kernel', 'langchain', 'langgraph', 'autogen'];
  const azureServices = ['cosmosDB', 'document intelligence', 'azure openai', 'AI Search'];
  const designPatterns = ['RAG', 'single agent', 'multi-agent'];
  const industries = ['professional services', 'media & entertainment', 'construction'];
  const projectTypes = ['application', 'code samples'];

  /**
   * Handles the change event for checkboxes.
   * @param value - The value of the checkbox.
   * @param selectedValues - The current array of selected values.
   * @param setFunction - The state setter function for the selected values.
   */
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
        Filters & Sort
      </h2>

      <div className="space-y-6 text-sm">
        {/* Helper array to render filter sections dynamically */}
        {[
          {
            title: 'Programming Language',
            items: programmingLanguages,
            selected: filters.programmingLanguages,
            setSelected: (vals: string[]) =>
              setFilters((prev) => ({ ...prev, programmingLanguages: vals })),
          },
          {
            title: 'Frameworks',
            items: frameworks,
            selected: filters.frameworks,
            setSelected: (vals: string[]) =>
              setFilters((prev) => ({ ...prev, frameworks: vals })),
          },
          {
            title: 'Azure Services',
            items: azureServices,
            selected: filters.azureServices,
            setSelected: (vals: string[]) =>
              setFilters((prev) => ({ ...prev, azureServices: vals })),
          },
          {
            title: 'Design Patterns',
            items: designPatterns,
            selected: filters.designPatterns,
            setSelected: (vals: string[]) =>
              setFilters((prev) => ({ ...prev, designPatterns: vals })),
          },
          {
            title: 'Industry',
            items: industries,
            selected: filters.industries,
            setSelected: (vals: string[]) =>
              setFilters((prev) => ({ ...prev, industries: vals })),
          },
          {
            title: 'Project Type',
            items: projectTypes,
            selected: filters.projectTypes,
            setSelected: (vals: string[]) =>
              setFilters((prev) => ({ ...prev, projectTypes: vals })),
          },
        ].map(({ title, items, selected, setSelected }) => (
          <div key={title}>
            <h3 className="font-semibold mb-2">{title}</h3>
            <div className="space-y-2 text-xs">
              {items.map((item) => (
                <label key={item} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border border-neutral-700 bg-neutral-800"
                    checked={selected.includes(item)}
                    onChange={() => handleCheckboxChange(item, selected, setSelected)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Sort Options */}
        <div>
          <h3 className="font-semibold mb-2">Sort By</h3>
          <select
            className="w-full text-sm bg-neutral-800 border border-neutral-700 rounded-md p-1"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            <option value="">None</option>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
