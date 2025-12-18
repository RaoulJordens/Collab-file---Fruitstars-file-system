
import React, { useState, useCallback } from 'react';
import { FileBrowser } from './FileBrowser';
import { Header } from './Header';
import type { File, Folder, Label } from '../types';
import { UploadDialog } from './UploadDialog';

interface MainPanelProps {
  currentFolder: Folder;
  rootFolder: Folder;
  path: Folder[];
  onFolderClick: (folderId: string) => void;
  onNavigate: (folderId: string) => void;
  onAddLabel: (fileId: string, label: Label) => Promise<void>;
  onMoveFile: (fileId: string, targetFolderId: string) => Promise<void>;
  onAddFile: (folderId: string, newFile: Omit<File, 'id' | 'lastModified' | 'previewUrl'>) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onAddFolder: (parentId: string, folderName: string, details: Partial<Folder>) => Promise<void>;
  onUpdateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
  onMenuClick: () => void;
  isMobile: boolean;
}

export function MainPanel({ currentFolder, rootFolder, path, onFolderClick, onNavigate, onAddLabel, onMoveFile, onAddFile, onDeleteFile, onAddFolder, onUpdateFolder, onMenuClick, isMobile }: MainPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [draggedFile, setDraggedFile] = useState<globalThis.File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDraggedFile(e.dataTransfer.files[0]);
      setIsUploadOpen(true);
      e.dataTransfer.clearData();
    }
  }, []);
  
  const handleUploadDialogClose = () => {
      setIsUploadOpen(false);
      setDraggedFile(null); // Reset dragged file when dialog is closed
  }

  return (
    <div 
      className={`relative flex-1 space-y-6 p-4 md:p-6 lg:p-8 ${isDragging ? 'outline-dashed outline-2 outline-primary' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-primary/10">
          <div className="rounded-lg bg-card p-4 text-center">
            <h3 className="text-lg font-medium text-foreground">Drop file to upload</h3>
            <p className="text-sm text-muted-foreground">Drop your file anywhere in this folder to upload it.</p>
          </div>
        </div>
      )}
      <Header 
        currentFolder={currentFolder} 
        rootFolder={rootFolder} 
        path={path} 
        onNavigate={onNavigate} 
        onAddFile={onAddFile} 
        onAddFolder={onAddFolder} 
        onUpdateFolder={onUpdateFolder}
        onMenuClick={onMenuClick}
        isMobile={isMobile}
      />
      <FileBrowser
        currentFolder={currentFolder}
        rootFolder={rootFolder}
        path={path}
        onFolderClick={onFolderClick}
        onAddLabel={onAddLabel}
        onMoveFile={onMoveFile}
        onDeleteFile={onDeleteFile}
      />
      <UploadDialog
        isOpen={isUploadOpen}
        onOpenChange={handleUploadDialogClose}
        onUpload={onAddFile}
        currentFolder={currentFolder}
        rootFolder={rootFolder}
        path={path}
        initialFile={draggedFile}
      />
    </div>
  );
}