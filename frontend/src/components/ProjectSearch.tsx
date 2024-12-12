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
  id: number;
  description: string;
  githubUrl: string;
  tags?: string[];
}

interface ProjectFormData {
  description: string;
  githubUrl: string;
}

const ProjectSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadFormData, setUploadFormData] = useState<ProjectFormData>({
    description: '',
    githubUrl: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch('/api/search_projects', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: searchQuery }),
        });
        
        const data = await response.json();
        console.log('Response from server:', data); // Add this line
        setResults(data.results);
        console.log('Updated results state:', data.results); // Add this line
        } catch (error) {
        console.error('Error searching projects:', error);
        } finally {
        setIsSearching(false);
        }
    };

  const handleSubmitProject = async () => {
    try {
      const response = await fetch('/api/add_project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadFormData),
      });
      
      if (response.ok) {
        setUploadFormData({ description: '', githubUrl: '' });
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  return (
    <div className="max-w-6xl w-full p-6 space-y-8">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight">
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
                    className="text-lg pr-12"
                />
                </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  variant="darkBlue"
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
                  <Button variant="outline" size="lg" className="h-12">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Project description..."
                      value={uploadFormData.description}
                      onChange={(e) => setUploadFormData({
                        ...uploadFormData,
                        description: e.target.value
                      })}
                    />
                    <Input
                      placeholder="GitHub repository URL..."
                      value={uploadFormData.githubUrl}
                      onChange={(e) => setUploadFormData({
                        ...uploadFormData,
                        githubUrl: e.target.value
                      })}
                    />
                    <Button 
                      className="w-full" 
                      onClick={handleSubmitProject}
                      disabled={!uploadFormData.description || !uploadFormData.githubUrl}
                    >
                      Submit Project
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
          <h2 className="text-2xl font-semibold">Search Results</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((result) => (
              <Card key={result.id} className="group hover:shadow-2xl hover:scale-105 transition transform duration-200 ease-out bg-neutral-800">
                <CardContent className="p-6">
                  <p className="mb-4 text-lg text-white">{result.description}</p>
                  <a
                    href={result.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    View on GitHub
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSearch;