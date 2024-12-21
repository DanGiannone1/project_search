export interface Project {
  id: string;
  projectName?: string;
  projectDescription: string;
  githubUrl: string;
  owner?: string;
  programmingLanguages?: string[];
  frameworks?: string[];
  azureServices?: string[];
  designPatterns?: string[];
  projectType?: string;
  codeComplexity?: 'Beginner' | 'Intermediate' | 'Advanced';
  businessValue?: string;
  targetAudience?: string;
  approved?: boolean;
  rejectionReason?: string;
  industries?: string[];
  review_status?: string;
}

export interface Filters {
  programmingLanguages: string[];
  frameworks: string[];
  azureServices: string[];
  designPatterns: string[];
  industries: string[];
  projectTypes: string[];
  codeComplexities: string[];
}

export interface AvailableOptions {
  programmingLanguages: string[];
  frameworks: string[];
  azureServices: string[];
  azureServiceCategories: {
    [service: string]: string;  // maps service name to category
  };
  designPatterns: string[];
  industries: string[];
  projectTypes: string[];
  codeComplexities: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface ApprovedTags {
  programmingLanguages: string[];
  frameworks: string[];
  azureServices: string[];
  azureServiceCategories: {
    [service: string]: string;  // maps service name to category
  };
  designPatterns: string[];
  industries: string[];
  projectTypes: string[];
  codeComplexities: string[];
}