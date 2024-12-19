// frontend/src/components/AdminDashboard/TagManagementPanel.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Plus, X, Loader2 } from 'lucide-react';

export interface ApprovedTags {
  programming_languages: string[];
  frameworks: string[];
  azure_services: {
    application: string[];
    data: string[];
    ai: string[];
  };
  design_patterns: string[];
  industry: string[];
}

export interface TagManagementPanelProps {
  tags: ApprovedTags | null;
  onTagsUpdate: (updatedTags: ApprovedTags) => Promise<void>;
}

const TagManagementPanel = ({ tags, onTagsUpdate }: TagManagementPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    programming_languages: true,
    frameworks: true,
    azure_services: true,
    design_patterns: true,
    industry: true,
  });
  const [newTags, setNewTags] = useState<{ [key: string]: string }>({
    programming_languages: '',
    frameworks: '',
    'azure_services.application': '',
    'azure_services.data': '',
    'azure_services.ai': '',
    design_patterns: '',
    industry: '',
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addTag = (category: string, subcategory?: string) => {
    if (!tags) return;

    const newTagValue = newTags[subcategory ? `azure_services.${subcategory}` : category].trim();
    if (!newTagValue) return;

    const updatedTags = { ...tags };
    if (subcategory) {
      updatedTags.azure_services[subcategory as keyof typeof updatedTags.azure_services] = [
        ...updatedTags.azure_services[subcategory as keyof typeof updatedTags.azure_services],
        newTagValue,
      ];
    } else {
      (updatedTags[category as keyof typeof updatedTags] as string[]).push(newTagValue);
    }

    setNewTags(prev => ({
      ...prev,
      [subcategory ? `azure_services.${subcategory}` : category]: '',
    }));
    onTagsUpdate(updatedTags);
  };

  const removeTag = (category: string, tag: string, subcategory?: string) => {
    if (!tags) return;

    const updatedTags = { ...tags };
    if (subcategory) {
      updatedTags.azure_services[subcategory as keyof typeof updatedTags.azure_services] =
        updatedTags.azure_services[subcategory as keyof typeof updatedTags.azure_services].filter(
          t => t !== tag
        );
    } else {
      (updatedTags[category as keyof typeof updatedTags] as string[]) = (
        updatedTags[category as keyof typeof updatedTags] as string[]
      ).filter(t => t !== tag);
    }

    onTagsUpdate(updatedTags);
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'programming_languages':
        return 'text-red-400';
      case 'frameworks':
        return 'text-green-400';
      case 'azure_services':
        return 'text-blue-400';
      case 'design_patterns':
        return 'text-yellow-400';
      case 'industry':
        return 'text-pink-400';
      default:
        return 'text-indigo-400';
    }
  };

  const renderTagSection = (title: string, category: string, items: string[]) => (
    <div className="mb-6">
      <div
        className="flex items-center cursor-pointer mb-2"
        onClick={() => toggleSection(category)}
      >
        {expandedSections[category] ? (
          <ChevronDown className="w-5 h-5 mr-1" />
        ) : (
          <ChevronRight className="w-5 h-5 mr-1" />
        )}
        <h3 className={`text-sm font-semibold ${getCategoryColor(category)}`}>{title}</h3>
      </div>

      {expandedSections[category] && (
        <>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder={`Add new ${title.toLowerCase()}`}
              value={newTags[category]}
              onChange={e =>
                setNewTags(prev => ({
                  ...prev,
                  [category]: e.target.value,
                }))
              }
              className="bg-neutral-800/50 border-neutral-700/50 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
            />
            <Button
              onClick={() => addTag(category)}
              size="sm"
              variant="secondary"
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map(tag => {
              const bgColorClass = (() => {
                switch (category) {
                  case 'programming_languages':
                    return 'bg-red-900/50';
                  case 'frameworks':
                    return 'bg-green-900/50';
                  case 'design_patterns':
                    return 'bg-yellow-900/50';
                  case 'industry':
                    return 'bg-pink-900/50';
                  default:
                    return 'bg-neutral-800/50';
                }
              })();

              return (
                <div
                  key={tag}
                  className={`flex items-center ${bgColorClass} text-gray-200 px-2 py-1 rounded-md text-xs transition-colors hover:bg-opacity-75`}
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(category, tag)}
                    className="ml-2 text-gray-400 hover:text-gray-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const renderAzureServices = () => (
    <div className="mb-6">
      <div
        className="flex items-center cursor-pointer mb-2"
        onClick={() => toggleSection('azure_services')}
      >
        {expandedSections['azure_services'] ? (
          <ChevronDown className="w-5 h-5 mr-1" />
        ) : (
          <ChevronRight className="w-5 h-5 mr-1" />
        )}
        <h3 className="text-sm font-semibold text-blue-400">Azure Services</h3>
      </div>

      {expandedSections['azure_services'] && tags && (
        <div className="pl-4">
          {Object.entries(tags.azure_services).map(([category, services]) => (
            <div key={category} className="mb-4">
              <h4 className="text-sm font-medium text-blue-300 mb-2 capitalize">{category}</h4>
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder={`Add new ${category} service`}
                  value={newTags[`azure_services.${category}`]}
                  onChange={e =>
                    setNewTags(prev => ({
                      ...prev,
                      [`azure_services.${category}`]: e.target.value,
                    }))
                  }
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
                <Button
                  onClick={() => addTag('azure_services', category)}
                  size="sm"
                  variant="secondary"
                  className="whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {services.map(service => (
                  <div
                    key={service}
                    className="flex items-center bg-blue-900/50 text-gray-200 px-2 py-1 rounded-md text-xs"
                  >
                    <span>{service}</span>
                    <button
                      onClick={() => removeTag('azure_services', service, category)}
                      className="ml-2 text-gray-400 hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!tags) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">
          Manage Approved Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderTagSection('Programming Languages', 'programming_languages', tags.programming_languages)}
        {renderTagSection('Frameworks', 'frameworks', tags.frameworks)}
        {renderAzureServices()}
        {renderTagSection('Design Patterns', 'design_patterns', tags.design_patterns)}
        {renderTagSection('Industries', 'industry', tags.industry)}
      </CardContent>
    </Card>
  );
};

export default TagManagementPanel;