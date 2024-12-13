// types.ts
export interface Project {
    id: number | string;
    projectName?: string;
    description: string;
    githubUrl: string;
    owner?: string;
    tags?: string[];
  }
  
  export interface ProjectFormData {
    projectName: string;
    description: string;
    githubUrl: string;
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
  