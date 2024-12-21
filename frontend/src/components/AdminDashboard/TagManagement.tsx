import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { Code2, Box, LayoutTemplate, Globe, Layers, Cloud } from 'lucide-react';
import { toast } from 'react-toastify';
import { ApprovedTags } from '../ProjectSearch/types';

/**
 * Props:
 *   - approvedTags: The combined data from the server, already in the shape of
 *     { azureServices: [...], azureServiceCategories: { service: category }, etc. }
 *   - onUpdateTags: Called with the final updated object when user clicks “Save All Changes.”
 */
interface TagManagementProps {
  approvedTags: ApprovedTags;
  onUpdateTags: (newTags: ApprovedTags) => Promise<void>;
}

// We define “regular” categories that are just arrays of strings
const regularCategories = [
  {
    key: 'programmingLanguages',
    label: 'Programming Languages',
    color: 'text-red-400',
    bgColor: 'bg-red-900/50',
    icon: Code2,
  },
  {
    key: 'frameworks',
    label: 'Frameworks',
    color: 'text-green-400',
    bgColor: 'bg-green-900/50',
    icon: Box,
  },
  {
    key: 'designPatterns',
    label: 'Design Patterns',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/50',
    icon: LayoutTemplate,
  },
  {
    key: 'industries',
    label: 'Industries',
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/50',
    icon: Globe,
  },
  {
    key: 'projectTypes',
    label: 'Project Types',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/50',
    icon: Layers,
  },
];

// Potential categories for Azure services
const azureCategories = ['none', 'AI', 'Data', 'Application'];

const TagManagement: React.FC<TagManagementProps> = ({ approvedTags, onUpdateTags }) => {
  /**
   * We keep local state for each array of tags (like programmingLanguages, frameworks, azureServices).
   * “editingTags” is an object: { programmingLanguages: [...], frameworks: [...], azureServices: [...], ... }
   */
  const [editingTags, setEditingTags] = useState<{ [key: string]: string[] }>({});
  
  /**
   * A separate local state for the dictionary of { serviceName -> category }, so
   * azureServiceCategories["Azure AI Search"] = "Data", for example.
   */
  const [azureServiceCategories, setAzureServiceCategories] = useState<{ [service: string]: string }>({});

  /**
   * For each category, we track a “new tag input” so user can type a new tag
   * before adding it (by pressing Enter or clicking +).
   */
  const [newTags, setNewTags] = useState<{ [key: string]: string }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------------------------
  // Initialize from approvedTags
  // -------------------------------
  useEffect(() => {
    // Build a fresh “editingTags” object for the regular categories + azureServices
    const nextEditing: { [key: string]: string[] } = {};

    // 1) Copy regular categories
    regularCategories.forEach(cat => {
      const key = cat.key as keyof ApprovedTags;
      nextEditing[cat.key] = Array.isArray(approvedTags[key])
        ? [...(approvedTags[key] as string[])]
        : [];
    });

    // 2) Copy azureServices array
    if (Array.isArray(approvedTags.azureServices)) {
      nextEditing['azureServices'] = [...approvedTags.azureServices];
    } else {
      nextEditing['azureServices'] = [];
    }

    setEditingTags(nextEditing);

    // 3) The dictionary of { serviceName -> category }
    if (approvedTags.azureServiceCategories) {
      setAzureServiceCategories({ ...approvedTags.azureServiceCategories });
    } else {
      setAzureServiceCategories({});
    }

    // 4) Initialize all new-tag inputs to ''
    const blank: { [key: string]: string } = {};
    regularCategories.forEach(cat => {
      blank[cat.key] = '';
    });
    blank['azureServices'] = '';
    setNewTags(blank);
  }, [approvedTags]);

  // ------------------------------------------------------
  // Functions for adding/removing in “regular” categories
  // ------------------------------------------------------
  const handleAddTag = (category: string) => {
    const val = newTags[category].trim();
    if (!val) return;

    if (editingTags[category].includes(val)) {
      toast.error('Tag already exists');
      return;
    }

    setEditingTags(prev => ({
      ...prev,
      [category]: [...prev[category], val],
    }));

    // Clear the input
    setNewTags(prev => ({ ...prev, [category]: '' }));
  };

  const handleRemoveTag = (category: string, tag: string) => {
    setEditingTags(prev => ({
      ...prev,
      [category]: prev[category].filter(t => t !== tag),
    }));
  };

  // ------------------------------------------------------
  // Functions for Azure services
  // ------------------------------------------------------
  const handleAddAzureService = () => {
    const svc = newTags['azureServices'].trim();
    if (!svc) return;

    if (editingTags['azureServices'].includes(svc)) {
      toast.error('Azure service already exists');
      return;
    }

    // By default, new service gets the first category in the azureCategories array
    const defaultCategory = azureCategories[0];

    setEditingTags(prev => ({
      ...prev,
      azureServices: [...prev.azureServices, svc],
    }));
    setAzureServiceCategories(prev => ({
      ...prev,
      [svc]: defaultCategory,
    }));

    // Clear the input
    setNewTags(prev => ({ ...prev, azureServices: '' }));
  };

  const handleRemoveAzureService = (svc: string) => {
    setEditingTags(prev => ({
      ...prev,
      azureServices: prev.azureServices.filter(s => s !== svc),
    }));
    setAzureServiceCategories(prev => {
      const updated = { ...prev };
      delete updated[svc];
      return updated;
    });
  };

  const handleChangeAzureServiceCategory = (svc: string, category: string) => {
    setAzureServiceCategories(prev => ({
      ...prev,
      [svc]: category,
    }));
  };

  // ------------------------------------------------------
  // Save: Merge everything & pass to the parent
  // ------------------------------------------------------
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Build a new ApprovedTags object. We keep the old data, but override each array from editingTags,
      // plus override the azureServiceCategories dictionary.
      const merged: ApprovedTags = {
        ...approvedTags,
        ...editingTags, // merges arrays like frameworks, designPatterns, azureServices, etc.
        azureServiceCategories, // merges the updated dictionary
      };

      await onUpdateTags(merged);
      toast.success('Tags updated successfully!');
    } catch (err) {
      console.error('Error updating tags:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update tags');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------
  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-white">Tag Management</h2>
        <Button
          variant="default"
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Save All Changes
        </Button>
      </div>

      <CardContent className="space-y-8">
        {/* 1) Regular Categories */}
        <div className="space-y-8">
          {regularCategories.map(cat => {
            const Icon = cat.icon;
            const catKey = cat.key;
            const labelCount = editingTags[catKey]?.length || 0;

            return (
              <div key={catKey} className="space-y-4">
                <h3 className={`font-medium ${cat.color} flex items-center gap-2`}>
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  <span className="text-gray-400 text-sm">{labelCount} tags</span>
                </h3>

                <div className="flex gap-2">
                  <Input
                    value={newTags[catKey] || ''}
                    onChange={(e) =>
                      setNewTags(prev => ({ ...prev, [catKey]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(catKey);
                      }
                    }}
                    placeholder={`Add a ${cat.label}...`}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                  <Button
                    onClick={() => handleAddTag(catKey)}
                    variant="secondary"
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {editingTags[catKey]?.map(tag => (
                    <div
                      key={tag}
                      className={`flex items-center gap-2 px-2 py-1 ${cat.bgColor} rounded-md group`}
                    >
                      <span className="text-gray-200 text-sm">{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(catKey, tag)}
                        className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2) Azure Services Section */}
        <div className="space-y-6">
          <h3 className="text-blue-400 font-medium flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Azure Services
            <span className="text-gray-400 text-sm">
              {editingTags['azureServices']?.length || 0} tags
            </span>
          </h3>

          {/* Input row for adding a new Azure service */}
          <div className="flex gap-2 items-center">
            <Input
              value={newTags['azureServices'] || ''}
              onChange={(e) =>
                setNewTags(prev => ({ ...prev, azureServices: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAzureService();
                }
              }}
              placeholder="Add new Azure service..."
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <Button
              onClick={handleAddAzureService}
              variant="secondary"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing Azure services */}
          <div className="space-y-2">
            {editingTags['azureServices']?.map((service) => (
              <div
                key={service}
                className="flex items-center gap-2 px-2 py-1 bg-blue-900/50 rounded-md"
              >
                <span className="text-gray-200 text-sm">{service}</span>
                <select
                  value={azureServiceCategories[service] || azureCategories[0]}
                  onChange={(e) =>
                    handleChangeAzureServiceCategory(service, e.target.value)
                  }
                  className="bg-neutral-800 border border-neutral-700 text-white px-2 py-1 rounded"
                >
                  {azureCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemoveAzureService(service)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TagManagement;
