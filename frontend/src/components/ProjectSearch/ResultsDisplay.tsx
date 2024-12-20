// frontend/src/components/ProjectSearch/ResultsDisplay.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from './types';
import { ExternalLink, Code2, Box, Layers, LayoutTemplate, Activity, Cloud, Gem, User, Globe  } from 'lucide-react';

interface ResultsDisplayProps {
    results: Project[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[1600px] mx-auto px-8">
            {results.map((result) => (
                <Card 
                    key={result.id} 
                    className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all hover:shadow-lg rounded-xl overflow-hidden"
                    style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                >
                    <CardContent className="p-10 space-y-6">
                        {/* Header Section */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500 truncate">
                                    {result.projectName || 'Untitled Project'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1 truncate">
                                    {result.owner || 'anonymous'}
                                </p>
                            </div>

                            <a 
                                href={result.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-400 hover:text-blue-400 transition-colors p-1 flex-shrink-0"
                                title="Open in new tab"
                            >
                                <ExternalLink className="w-6 h-6" />
                            </a>
                        </div>
                        
                        {/* Description Section */}
                        <div className="prose prose-invert prose-sm max-w-none pb-6 border-b border-neutral-800">
                            <p className="text-gray-300 leading-relaxed">
                                {result.projectDescription || 'No description available'}
                            </p>
                        </div>

                        {/* Metadata Section */}
                        <div className="flex items-center gap-6 flex-wrap">
                            {/* Programming Languages */}
                            <div>
                                <h3 className="text-red-400 text-xs font-medium mb-1.5 flex items-center gap-1">
                                    <Code2 className="w-4 h-4" /> Programming Languages
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.programmingLanguages && result.programmingLanguages.length > 0 ? (
                                        result.programmingLanguages.map((lang, index) => (
                                            <span key={index} className="px-2 py-1 bg-red-900/50 text-gray-300 text-xs rounded-md">
                                                {lang}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-md">N/A</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Frameworks */}
                            <div>
                                <h3 className="text-green-400 text-xs font-medium mb-1.5 flex items-center gap-1">
                                    <Box className="w-4 h-4" /> Frameworks
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.frameworks && result.frameworks.length > 0 ? (
                                        result.frameworks.map((fw, index) => (
                                            <span key={index} className="px-2 py-1 bg-green-900/50 text-gray-300 text-xs rounded-md">
                                                {fw}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-md">N/A</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Project Type */}
                            <div>
                                <h3 className="text-cyan-400 text-xs font-medium mb-1.5 flex items-center gap-1">
                                    <Layers className="w-4 h-4" /> Project Type
                                </h3>
                                <span className="px-2 py-1 bg-cyan-900/50 text-gray-300 text-xs rounded-md">
                                    {result.projectType || 'N/A'}
                                </span>
                            </div>
                            
                            {/* Design Patterns */}
                            <div>
                                <h3 className="text-yellow-400 text-xs font-medium mb-1.5 flex items-center gap-1">
                                    <LayoutTemplate className="w-4 h-4" /> Design Patterns
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.designPatterns && result.designPatterns.length > 0 ? (
                                        result.designPatterns.map((pattern, index) => (
                                            <span key={index} className="px-2 py-1 bg-yellow-900/50 text-gray-300 text-xs rounded-md">
                                                {pattern}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-md">N/A</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Code Complexity */}
                            <div>
                                <h3 className="text-orange-400 text-xs font-medium mb-1.5 flex items-center gap-1">
                                    <Activity className="w-4 h-4" /> Code Complexity
                                </h3>
                                <span className="px-2 py-1 bg-orange-800/60 text-gray-200 text-xs rounded-md">
                                    {result.codeComplexity || 'N/A'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Azure Services */}
                        <div className="pb-6 border-b border-neutral-800">
                            <div>
                                <h3 className="text-blue-400 text-xs font-medium mb-2 flex items-center gap-1">
                                    <Cloud className="w-4 h-4" /> Azure Services
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.azureServices && result.azureServices.length > 0 ? (
                                        result.azureServices.map((service, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-900/50 text-gray-300 text-xs rounded-md">
                                                {service}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-md">N/A</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business Context Section */}
                        <div>
                            {/* Industries */}
                            <div className="pt-2">
                            <h3 className="text-pink-400 text-xs font-medium mb-2 flex items-center gap-1">
                                <Globe className="w-4 h-4" /> Industries
                            </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.industries && result.industries.length > 0 ? (
                                        result.industries.map((ind, index) => (
                                            <span key={index} className="px-2 py-1 bg-pink-900/50 text-gray-300 text-xs rounded-md">
                                                {ind}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-md">N/A</span>
                                    )}
                                </div>
                            </div>

                            {/* Business Value */}
                            <div className="pt-6">
                                <h3 className="text-teal-400 text-xs font-medium mb-2 flex items-center gap-1">
                                    <Gem className="w-4 h-4" /> Business Value
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {result.businessValue || 'No business value provided'}
                                </p>
                            </div>
                            
                            {/* Target Audience - remains unchanged */}
                            <div className="pt-6">
                                <h3 className="text-rose-400 text-xs font-medium mb-2 flex items-center gap-1">
                                    <User className="w-4 h-4" /> Target Audience
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {result.targetAudience || 'No target audience specified'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ResultsDisplay;