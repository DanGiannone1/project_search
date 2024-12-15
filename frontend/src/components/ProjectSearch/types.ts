// frontend/src/components/ProjectSearch/types.ts
// frontend/src/components/ProjectSearch/types.ts
export interface Project {
  id: string; // Made mandatory and of type string
  projectName?: string;
  projectDescription: string;
  githubUrl: string;
  owner?: string;
  programmingLanguages?: string[];
  frameworks?: string[];
  azureServices?: string[];
  designPatterns?: string[];
  projectType?: string;
  codeComplexityScore?: 'Beginner' | 'Intermediate' | 'Advanced';
  businessValue?: string;
  targetAudience?: string;
  approved?: boolean;
  rejectionReason?: string;
}


export interface Filters {
  programmingLanguages: string[];
  frameworks: string[];
  azureServices: string[];
  designPatterns: string[];
  industries: string[];
  projectTypes: string[];
}

export interface SortOption {
  value: string;
  label: string;
}
