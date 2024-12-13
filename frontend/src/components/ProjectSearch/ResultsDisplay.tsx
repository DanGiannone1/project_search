// ResultsDisplay.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Github } from 'lucide-react';
import { Project } from './types';

interface ResultsDisplayProps {
  results: Project[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  return (
    <div className="mt-12 px-16 mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-4">Search Results</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {results.map((result) => (
          <Card
            key={result.id}
            className="group hover:shadow-2xl transition-shadow duration-200 bg-neutral-800 border border-neutral-700"
          >
            <CardContent className="p-6 space-y-3">
              {result.projectName && (
                <h3 className="text-3xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 font-sans">
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
  );
};

export default ResultsDisplay;
