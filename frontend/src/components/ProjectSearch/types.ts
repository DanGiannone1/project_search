// frontend/src/components/ProjectSearch/types.ts
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
  review_status?: string; // NEW field to align with backend
}

export interface Filters {
  programmingLanguages: string[];
  frameworks: string[];
  azureServices: string[];
  designPatterns: string[];
  industries: string[];
  projectTypes: string[];
  codeComplexities: string[]; // NEW for code complexity
}

export interface SortOption {
  value: string;
  label: string;
}
