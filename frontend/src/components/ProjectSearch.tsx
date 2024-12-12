import { useState } from 'react';
import { Search, Plus, Github, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Project {
  id: number | string;
  projectName?: string;
  description: string;
  githubUrl: string;
  owner?: string;
  tags?: string[];
}

interface ProjectFormData {
  projectName: string;
  description: string;
  githubUrl: string;
}

function ProjectSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadFormData, setUploadFormData] = useState<ProjectFormData>({
    projectName: '',
    description: '',
    githubUrl: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch('/api/search_projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error searching projects:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitProject = async () => {
    setIsSubmittingProject(true);
    try {
      const response = await fetch('/api/add_project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadFormData),
      });
      
      if (response.ok) {
        setUploadFormData({ projectName: '', description: '', githubUrl: '' });
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  return (
    <div className="max-w-6xl w-full p-6 space-y-8 font-sans">
      <div className="text-center space-y-4 py-12">
        {/* Main heading with teal→cyan gradient text */}
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
          Project Search
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Discover similar projects using natural language search powered by AI
        </p>
      </div>

      <Card className="border-0 bg-neutral-900 shadow-xl hover:shadow-2xl transition-shadow">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Textarea
                  placeholder="Describe the project you're looking for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg pr-12 bg-neutral-800 border border-neutral-700 text-white"
                />
              </div>

              <div className="flex justify-end">
                {/* Use the accentGradient variant for Search button */}
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  variant="accentGradient"
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="w-5 h-5" />
                      <span>Search</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  {/* Use accentGradient for Add Project button too */}
                  <Button variant="accentGradient" size="lg" className="h-12">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-neutral-900 border border-neutral-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Project name..."
                      value={uploadFormData.projectName}
                      onChange={(e) => setUploadFormData({
                        ...uploadFormData,
                        projectName: e.target.value
                      })}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                    <Input
                      placeholder="Project description..."
                      value={uploadFormData.description}
                      onChange={(e) => setUploadFormData({
                        ...uploadFormData,
                        description: e.target.value
                      })}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                    <Input
                      placeholder="GitHub repository URL..."
                      value={uploadFormData.githubUrl}
                      onChange={(e) => setUploadFormData({
                        ...uploadFormData,
                        githubUrl: e.target.value
                      })}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                    {/* Submit Project button with accentGradient */}
                    <Button 
                      className="w-full"
                      onClick={handleSubmitProject}
                      disabled={
                        !uploadFormData.description ||
                        !uploadFormData.githubUrl ||
                        !uploadFormData.projectName ||
                        isSubmittingProject
                      }
                      variant="accentGradient"
                    >
                      {isSubmittingProject ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <span>Submit Project</span>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Search Results</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((result) => (
              <Card
                key={result.id}
                className="group hover:shadow-2xl transition-shadow duration-200 bg-neutral-800 border border-neutral-700"
              >
                <CardContent className="p-6 space-y-3">
                  {result.projectName && (
                    // Apply the new teal→cyan gradient for project name
                    <h3 className="text-3xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 font-sans">
                      {result.projectName}
                    </h3>
                  )}
                  <p className="mb-1 text-lg text-white">
                    {result.description}
                  </p>
                  {result.owner && (
                    <p className="text-sm text-neutral-400 italic">
                      {result.owner}
                    </p>
                  )}
                  <a
                    href={result.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-300 hover:text-cyan-200 transition-colors mt-2"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    <span>View on GitHub</span>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectSearch;
