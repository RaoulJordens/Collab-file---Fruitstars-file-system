
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2 } from './Icons';
import type { Folder } from '../types';
import { Dialog, Button } from './UI';

interface FolderActionsProps {
  folder: Folder;
  onDeleteFolder: (folderId: string) => Promise<void>;
}

export function FolderActions({ folder, onDeleteFolder }: FolderActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteFolder(folder.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-muted">
        <MoreVertical className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border">
          <ul className="py-1 text-sm text-foreground">
            <li className="px-4 py-2 text-xs text-muted-foreground">Folder Actions</li>
            <li>
              <button onClick={() => { setIsOpen(false); setShowDeleteConfirm(true); }} className="w-full text-left px-4 py-2 hover:bg-muted text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4"/> Delete Folder
              </button>
            </li>
          </ul>
        </div>
      )}
      
      <Dialog 
        isOpen={showDeleteConfirm} 
        onOpenChange={setShowDeleteConfirm}
        title="Delete Folder?"
        description={`This will permanently delete the folder "${folder.name}" and everything inside it. This action cannot be undone.`}
      >
        <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting} disabled={isDeleting}>
              Delete Permanently
            </Button>
        </div>
      </Dialog>
    </div>
  );
}
