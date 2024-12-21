// File: src/components/AdminDashboard/TagManagement.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { Code2, Box, Layers, LayoutTemplate, Cloud, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import { ApprovedTags } from '../ProjectSearch/types';

interface TagManagementProps {
  approvedTags: ApprovedTags;
  onUpdateTags: (newTags: ApprovedTags) => Promise<void>;
}

const regularCategories = [
  { 
    key: 'programmingLanguages', 
    label: 'Programming Languages', 
    color: 'text-red-400',
    bgColor: 'bg-red-900/50',
    icon: Code2 
  },
  { 
    key: 'frameworks', 
    label: 'Frameworks', 
    color: 'text-green-400',
    bgColor: 'bg-green-900/50',
    icon: Box 
  },
  { 
    key: 'designPatterns', 
    label: 'Design Patterns', 
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/50',
    icon: LayoutTemplate 
  },
  { 
    key: 'industries', 
    label: 'Industries', 
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/50',
    icon: Globe 
  },
  { 
    key: 'projectTypes', 
    label: 'Project Types', 
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/50',
    icon: Layers 
  }
];

// Predefined Azure service categories
const azureCategories = ['AI', 'Data', 'Application'];

interface CategorySectionProps {
  category: {
    key: string;
    label: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{className?: string}>;
  };
  newTagValue: string;
  onNewTagValueChange: (val: string) => void;
  editingTags: {[key: string]: string[]};
  onAddTag: (categoryKey: string) => void;
  onRemoveTag: (categoryKey: string, tag: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  newTagValue,
  onNewTagValueChange,
  editingTags,
  onAddTag,
  onRemoveTag
}) => {
  const Icon = category.icon;
  return (
    <div className="space-y-4">
      <h3 className={`font-medium ${category.color} flex items-center gap-2`}>
        <Icon className="w-4 h-4" />
        {category.label}
        <span className="text-gray-400 text-sm">
          {editingTags[category.key]?.length || 0} tags
        </span>
      </h3>

      <div className="flex gap-2">
        <Input
          value={newTagValue}
          onChange={(e) => onNewTagValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddTag(category.key);
            }
          }}
          placeholder="Add new tag..."
          className="bg-neutral-800 border-neutral-700 text-white"
        />
        <Button
          onClick={() => onAddTag(category.key)}
          variant="secondary"
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {editingTags[category.key]?.map((tag) => (
          <div
            key={tag}
            className={`flex items-center gap-2 px-2 py-1 ${category.bgColor} rounded-md group`}
          >
            <span className="text-gray-200 text-sm">{tag}</span>
            <button
              onClick={() => onRemoveTag(category.key, tag)}
              className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TagManagement: React.FC<TagManagementProps> = ({ approvedTags, onUpdateTags }) => {
  const allCategories = [...regularCategories, { key: 'azureServices' }];

  // Initialize editing tags for all categories
  const [editingTags, setEditingTags] = useState<{ [key: string]: string[] }>(() => {
    const initialTags: { [key: string]: string[] } = {};
    allCategories.forEach(category => {
      const key = category.key;
      if (Array.isArray(approvedTags[key as keyof ApprovedTags])) {
        initialTags[key] = [...(approvedTags[key as keyof ApprovedTags] as string[])];
      } else {
        initialTags[key] = [];
      }
    });
    return initialTags;
  });
  
  const [newTags, setNewTags] = useState<{ [key: string]: string }>(() => {
    const initialNewTags: { [key: string]: string } = {};
    allCategories.forEach(category => {
      initialNewTags[category.key] = '';
    });
    return initialNewTags;
  });

  // Azure service mapping state
  const [azureServiceCategories, setAzureServiceMapping] = useState<{ [service: string]: string }>(
    () => ({ ...approvedTags.azureServiceCategories })
  );

  // For adding a new azure service with category selection
  const [newAzureServiceCategory, setNewAzureServiceCategory] = useState(azureCategories[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (category: string) => {
    const tagValue = newTags[category].trim();
    if (!tagValue) return;
    
    if (editingTags[category].includes(tagValue)) {
      toast.error('Tag already exists');
      return;
    }
    
    setEditingTags(prev => ({
      ...prev,
      [category]: [...prev[category], tagValue]
    }));

    // If we are adding an azure service, also update its mapping
    if (category === 'azureServices') {
      setAzureServiceMapping(prev => ({
        ...prev,
        [tagValue]: newAzureServiceCategory
      }));
    }

    setNewTags(prev => ({
      ...prev,
      [category]: ''
    }));
  };

  const handleRemoveTag = (category: string, tag: string) => {
    setEditingTags(prev => ({
      ...prev,
      [category]: prev[category].filter(t => t !== tag)
    }));

    // If removing an azure service, remove from mapping too
    if (category === 'azureServices') {
      setAzureServiceMapping(prev => {
        const updated = { ...prev };
        delete updated[tag];
        return updated;
      });
    }
  };

  const handleChangeAzureServiceCategory = (service: string, category: string) => {
    setAzureServiceMapping(prev => ({
      ...prev,
      [service]: category
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateTags({ 
        ...approvedTags, 
        ...editingTags,
        azureServiceCategories // Include the updated azure service mapping
      });
      toast.success('Tags updated successfully');
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Regular Categories */}
        <div className="space-y-8">
          {regularCategories.map((category) => (
            <CategorySection
              key={category.key}
              category={category}
              newTagValue={newTags[category.key]}
              onNewTagValueChange={(val) => setNewTags(prev => ({ ...prev, [category.key]: val }))}
              editingTags={editingTags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
          ))}
        </div>

        {/* Azure Services Section */}
        <div className="space-y-6">
          <h3 className="text-blue-400 font-medium flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Azure Services
            <span className="text-gray-400 text-sm">
              {editingTags['azureServices']?.length || 0} tags
            </span>
          </h3>

          <div className="flex gap-2 items-center">
            <Input
              value={newTags['azureServices']}
              onChange={(e) => {
                setNewTags(prev => ({ ...prev, azureServices: e.target.value }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('azureServices');
                }
              }}
              placeholder="Add new Azure service..."
              className="bg-neutral-800 border-neutral-700 text-white"
            />

            <select
              value={newAzureServiceCategory}
              onChange={(e) => setNewAzureServiceCategory(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white px-2 py-1 rounded"
            >
              {azureCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <Button
              onClick={() => handleAddTag('azureServices')}
              variant="secondary"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {editingTags['azureServices']?.map((service) => (
              <div
                key={service}
                className="flex items-center gap-2 px-2 py-1 bg-blue-900/50 rounded-md"
              >
                <span className="text-gray-200 text-sm">{service}</span>
                <select
                  value={azureServiceCategories[service] || azureCategories[0]}
                  onChange={(e) => handleChangeAzureServiceCategory(service, e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white px-2 py-1 rounded"
                >
                  {azureCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemoveTag('azureServices', service)}
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
