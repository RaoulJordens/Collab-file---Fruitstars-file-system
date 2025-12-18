

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, FolderSync, Tag } from './Icons';
import type { File, Folder, Label } from '../types';
import { allLabels } from '../constants';
import { Dialog, Button } from './UI';

interface FileActionsProps {
  file: File;
  rootFolder: Folder;
  path: Folder[];
  onAddLabel: (fileId: string, label: Label) => Promise<void>;
  onMoveFile: (fileId: string, targetFolderId: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
}

export function FileActions({ file, rootFolder, onAddLabel, onMoveFile, onDeleteFile }: FileActionsProps) {
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
      await onDeleteFile(file.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getSubfolders = (folder: Folder): Folder[] => {
    let folders: Folder[] = [];
    if (folder.id !== 'root') {
      folders.push(folder);
    }
    folder.subFolders.forEach(sub => {
      folders = folders.concat(getSubfolders(sub));
    });
    return folders;
  };
  const allFolders = getSubfolders(rootFolder);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-muted">
        <MoreVertical className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border">
          <ul className="py-1 text-sm text-foreground">
            <li className="px-4 py-2 text-xs text-muted-foreground">Actions</li>
            <li className="group relative">
                <button className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2">
                    <Tag className="h-4 w-4"/> Add Label
                </button>
                <ul className="absolute left-full -top-2 mt-0 w-48 bg-card rounded-md shadow-lg border hidden group-hover:block">
                    {allLabels.map(label => (
                        <li key={label.id}><button onClick={() => { onAddLabel(file.id, label); setIsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-muted">{label.name}</button></li>
                    ))}
                </ul>
            </li>
            <li className="group relative">
                <button className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2">
                    <FolderSync className="h-4 w-4"/> Move File
                </button>
                <ul className="absolute left-full -top-2 mt-0 w-48 bg-card rounded-md shadow-lg border hidden group-hover:block max-h-60 overflow-y-auto">
                    {allFolders.map(folder => (
                        <li key={folder.id}><button onClick={() => { onMoveFile(file.id, folder.id); setIsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-muted">{folder.name}</button></li>
                    ))}
                </ul>
            </li>
            <hr className="my-1 border-border"/>
            <li>
              <button onClick={() => { setIsOpen(false); setShowDeleteConfirm(true); }} className="w-full text-left px-4 py-2 hover:bg-muted text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4"/> Delete
              </button>
            </li>
          </ul>
        </div>
      )}
      
      {/* FIX: The Dialog component requires children. Added a div with buttons as a child. */}
      <Dialog 
        isOpen={showDeleteConfirm} 
        onOpenChange={setShowDeleteConfirm}
        title="Are you absolutely sure?"
        description={`This will permanently delete "${file.name}". This action cannot be undone.`}
      >
        <div className="mt-4 flex justify-end gap-2">
            {/* FIX: The Button component requires children. Added text child. */}
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
            {/* FIX: The Button component requires children. Added text child. */}
            <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting} disabled={isDeleting}>
              Continue
            </Button>
        </div>
      </Dialog>
    </div>
  );
}