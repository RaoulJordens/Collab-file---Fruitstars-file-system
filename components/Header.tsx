
import React, { useState } from 'react';
import { FolderPlus, Upload, Users, Building, Package, Ship, FileText, Pencil, Anchor, Trash2 } from './Icons';
import { Breadcrumbs } from './Breadcrumbs';
import type { File, Folder } from '../types';
import { UploadDialog } from './UploadDialog';
import { NewFolderDialog } from './NewFolderDialog';
import { EditFolderDialog } from './EditFolderDialog';
import { DossierStatusIcons } from './DossierStatusIcons';
import { Button, Dialog } from './UI';

interface HeaderProps {
  currentFolder: Folder;
  rootFolder: Folder;
  path: Folder[];
  onNavigate: (folderId: string) => void;
  onAddFile: (folderId: string, newFile: Omit<File, 'id' | 'lastModified' | 'previewUrl'>) => Promise<void>;
  onAddFolder: (parentId: string, folderName: string, details: Partial<Folder>) => Promise<void>;
  onUpdateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onMenuClick: () => void;
  isMobile: boolean;
  canEdit: boolean;
}

export function Header({ currentFolder, rootFolder, path, onNavigate, onAddFile, onAddFolder, onUpdateFolder, onDeleteFolder, onMenuClick, isMobile, canEdit }: HeaderProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const parentOfCurrent = path.length > 1 ? path[path.length - 2] : null;
  const isDossierFolder = parentOfCurrent?.name === 'Container' || parentOfCurrent?.name === 'Residuals';
  const isEntityFolder = parentOfCurrent?.name === 'Clients' || parentOfCurrent?.name === 'Suppliers' || parentOfCurrent?.name === 'Products';
  const dossierType = parentOfCurrent?.name as 'Container' | 'Residuals' | undefined;
  
  const getNewFolderButtonText = () => {
    switch (currentFolder.name) {
        case 'Clients': return 'New Client';
        case 'Suppliers': return 'New Supplier';
        case 'Products': return 'New Product';
        case 'Procedures': return 'New Procedure Folder';
        case 'Container': case 'Residuals': return 'New Dossier';
        default: return 'New Folder';
    }
  }

  const isDescendantOfProcedures = path.some(p => p.id === 'f5');
  const isNewFolderActionAvailable = ['Clients', 'Suppliers', 'Products', 'Container', 'Residuals'].includes(currentFolder.name) || isDescendantOfProcedures;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeleteFolder(currentFolder.id);
    setIsDeleting(false);
    setIsDeleteConfirmOpen(false);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              {isMobile && (
                <Button variant="secondary" onClick={onMenuClick} className="!p-2 !h-10 !w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                </Button>
              )}
              <Breadcrumbs path={path} onNavigate={onNavigate} />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{currentFolder.name}</h1>
            {isDossierFolder && dossierType && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                {currentFolder.clientName && <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /><span>{currentFolder.clientName}</span></div>}
                {currentFolder.supplierName && <div className="flex items-center gap-1.5"><Building className="h-4 w-4" /><span>{currentFolder.supplierName}</span></div>}
                {currentFolder.productNames && currentFolder.productNames.length > 0 && <div className="flex items-center gap-1.5"><Package className="h-4 w-4" /><span>{currentFolder.productNames.join(', ')}</span></div>}
                {dossierType === 'Container' && currentFolder.containerNumber && <div className="flex items-center gap-1.5"><Ship className="h-4 w-4" /><span>{currentFolder.containerNumber}</span></div>}
                {dossierType === 'Container' && currentFolder.destinationPort && <div className="flex items-center gap-1.5"><Anchor className="h-4 w-4" /><span>{currentFolder.destinationPort}</span></div>}
                {dossierType === 'Residuals' && currentFolder.orderReference && <div className="flex items-center gap-1.5"><FileText className="h-4 w-4" /><span>{currentFolder.orderReference}</span></div>}
                <DossierStatusIcons dossier={currentFolder} type={dossierType} />
              </div>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-2 flex-wrap">
              {(isDossierFolder || isEntityFolder) && (
                <>
                  <Button variant="secondary" onClick={() => setIsEditFolderOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              {isNewFolderActionAvailable && (
                <Button variant="secondary" onClick={() => setIsNewFolderOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  {getNewFolderButtonText()}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <UploadDialog isOpen={isUploadOpen} onOpenChange={setIsUploadOpen} onUpload={onAddFile} currentFolder={currentFolder} rootFolder={rootFolder} path={path} />
      <NewFolderDialog isOpen={isNewFolderOpen} onOpenChange={setIsNewFolderOpen} onAddFolder={onAddFolder} rootFolder={rootFolder} currentFolder={currentFolder} />
      {(isDossierFolder || isEntityFolder) && <EditFolderDialog isOpen={isEditFolderOpen} onOpenChange={setIsEditFolderOpen} onUpdateFolder={onUpdateFolder} rootFolder={rootFolder} currentFolder={currentFolder} />}
      
      <Dialog 
        isOpen={isDeleteConfirmOpen} 
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Folder?"
        description={`Are you sure you want to delete "${currentFolder.name}" and all its contents? This action cannot be undone.`}
      >
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>Delete Permanently</Button>
        </div>
      </Dialog>
    </>
  );
}
