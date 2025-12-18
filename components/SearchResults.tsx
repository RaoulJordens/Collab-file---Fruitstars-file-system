

import React from 'react';
import type { File, Folder, SearchResultItem } from '../types';
import { FolderIcon, FileIcon } from './Icons';
import { Button } from './UI';

interface SearchResultsProps {
  results: SearchResultItem[];
  onResultClick: (result: SearchResultItem) => void;
  onClearSearch: () => void;
}

export function SearchResults({ results, onResultClick, onClearSearch }: SearchResultsProps) {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
        {/* FIX: The Button component requires children. Added text content. */}
        <Button variant="secondary" onClick={onClearSearch}>
            Back to Dashboard
        </Button>
      </div>
      
      {results.length > 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <ul className="divide-y divide-border">
            {results.map((result, index) => (
              <li key={`${result.item.id}-${index}`}>
                <button
                  onClick={() => onResultClick(result)}
                  className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center gap-4"
                >
                  {'subFolders' in result.item ? (
                    <FolderIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <FileIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-grow overflow-hidden">
                    <p className="font-medium truncate">{result.item.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{result.path}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center p-12 text-muted-foreground">
          <p>No results found.</p>
        </div>
      )}
    </div>
  );
}