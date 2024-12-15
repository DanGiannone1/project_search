// frontend/src/components/ProjectSearch/ResultsDisplay.tsx
import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Project } from './types';

interface ResultsDisplayProps {
    results: Project[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
    return (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
                <Card key={result.id} className="bg-neutral-800 border-neutral-700">
                    <CardContent>
                        {/* GitHub URL at the top */}
                        <CardTitle className="text-teal-500">
                            <a href={result.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {result.githubUrl}
                            </a>
                        </CardTitle>
                        
                        {/* Project Name */}
                        {result.projectName && (
                            <CardDescription className="mt-2 text-lg font-semibold text-white">
                                {result.projectName}
                            </CardDescription>
                        )}
                        
                        {/* Project Description */}
                        <CardDescription className="mt-2 text-sm text-gray-300">
                            {result.projectDescription}
                        </CardDescription>
                        
                        {/* Programming Languages */}
                        {result.programmingLanguages && result.programmingLanguages.length > 0 && (
                            <div className="mt-4">
                                <span className="font-semibold text-teal-500">Programming Languages:</span>
                                <ul className="list-disc list-inside">
                                    {result.programmingLanguages.map((lang, index) => (
                                        <li key={index}>{lang}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Frameworks */}
                        {result.frameworks && result.frameworks.length > 0 && (
                            <div className="mt-2">
                                <span className="font-semibold text-teal-500">Frameworks:</span>
                                <ul className="list-disc list-inside">
                                    {result.frameworks.map((fw, index) => (
                                        <li key={index}>{fw}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Azure Services */}
                        {result.azureServices && result.azureServices.length > 0 && (
                            <div className="mt-2">
                                <span className="font-semibold text-teal-500">Azure Services:</span>
                                <ul className="list-disc list-inside">
                                    {result.azureServices.map((service, index) => (
                                        <li key={index}>{service}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Design Patterns */}
                        {result.designPatterns && result.designPatterns.length > 0 && (
                            <div className="mt-2">
                                <span className="font-semibold text-teal-500">Design Patterns:</span>
                                <ul className="list-disc list-inside">
                                    {result.designPatterns.map((dp, index) => (
                                        <li key={index}>{dp}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Project Type */}
                        {result.projectType && (
                            <div className="mt-2">
                                <span className="font-semibold text-teal-500">Project Type:</span> {result.projectType}
                            </div>
                        )}
                        
                        {/* Code Complexity */}
                        {result.codeComplexityScore && (
                            <div className="mt-2">
                                <span className="font-semibold text-teal-500">Code Complexity:</span> {result.codeComplexityScore}
                            </div>
                        )}
                        
                        {/* Business Value */}
                        {result.businessValue && (
                            <div className="mt-2">
                                <span className="font-semibold text-teal-500">Business Value:</span> {result.businessValue}
                            </div>
                        )}
                        
                        {/* Target Audience */}
                        {result.targetAudience && (
                            <div className="mt-2">
                                <span className="font-semibold text-teal-500">Target Audience:</span> {result.targetAudience}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ResultsDisplay;
