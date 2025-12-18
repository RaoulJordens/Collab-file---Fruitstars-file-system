
import React from 'react';
import { ChevronRight } from './Icons';
import type { Folder } from '../types';

interface BreadcrumbsProps {
  path: Folder[];
  onNavigate: (folderId: string) => void;
}

export function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5">
        {path.map((folder, index) => (
          <li key={folder.id} className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigate(folder.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none disabled:text-foreground"
              disabled={index === path.length - 1}
              aria-current={index === path.length - 1 ? 'page' : undefined}
            >
              {folder.name}
            </button>
            {index < path.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
