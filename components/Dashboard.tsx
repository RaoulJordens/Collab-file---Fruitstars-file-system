

import React, { useMemo, useState, useEffect } from 'react';
import { differenceInDays, isFuture, parse, format } from 'date-fns';
import type { File, Folder, SearchResultItem } from '../types';
import { AlertCircle, Ship, Box, Upload, FolderPlus, Search, Trash2, ChevronRight, MenuIcon } from './Icons';
import { UploadDialog } from './UploadDialog';
import { NewFolderDialog } from './NewFolderDialog';
import { DossierStatusIcons } from './DossierStatusIcons';
import { Button, Input } from './UI';
import { SearchResults } from './SearchResults';
import { backendSpecContent } from '../backend_copilot_spec';
import { deploymentGuideContent } from '../deployment_guide';
import { useMediaQuery } from '../hooks/useMediaQuery';


interface ExpiringFile extends File {
  supplierName?: string;
}

interface DashboardProps {
  rootFolder: Folder;
  onNavigate: (folderId: string) => void;
  onAddFile: (folderId: string, newFile: Omit<File, 'id' | 'lastModified' | 'previewUrl'>) => Promise<void>;
  onAddFolder: (parentId: string, folderName: string, details?: Partial<Folder>) => Promise<void>;
  onSearch: (query: string) => void;
  searchQuery: string;
  searchResults: SearchResultItem[];
  onResultClick: (result: SearchResultItem) => void;
  onClearSearch: () => void;
  isMobile: boolean;
  onMenuClick: () => void;
}

export function Dashboard({ 
    rootFolder, 
    onNavigate, 
    onAddFile, 
    onAddFolder, 
    onSearch, 
    searchQuery,
    searchResults,
    onResultClick,
    onClearSearch,
    isMobile,
    onMenuClick
}: DashboardProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderTarget, setNewFolderTarget] = useState<Folder | null>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showBackendTodo, setShowBackendTodo] = useState(true);
  const [showDeployGuide, setShowDeployGuide] = useState(true);
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
  
  const isSmallScreen = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(localQuery);
    }
  };
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content.trim())
      .then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setCopyButtonText('Failed to copy');
         setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
      });
  };

  const expiringCertificates = useMemo(() => {
    const certificates: ExpiringFile[] = [];
    const suppliersFolder = rootFolder.subFolders.find(f => f.name === 'Suppliers');

    if (suppliersFolder) {
      for (const supplier of suppliersFolder.subFolders) {
        for (const file of supplier.files) {
          if (file.expirationDate) {
            const expDate = parse(file.expirationDate, 'yyyy-MM-dd', new Date());
            if (isFuture(expDate) && differenceInDays(expDate, new Date()) <= 28) {
              certificates.push({ ...file, supplierName: supplier.name });
            }
          }
        }
      }
    }
    return certificates.sort((a, b) => parse(a.expirationDate!, 'yyyy-MM-dd', new Date()).getTime() - parse(b.expirationDate!, 'yyyy-MM-dd', new Date()).getTime());
  }, [rootFolder]);

  const shipmentsFolder = rootFolder.subFolders.find(f => f.name === 'Shipments');
  const clientsFolder = rootFolder.subFolders.find(f => f.name === 'Clients');
  const suppliersFolder = rootFolder.subFolders.find(f => f.name === 'Suppliers');
  const containerFolder = shipmentsFolder?.subFolders.find(f => f.name === 'Container');
  
  const containerDossiers = containerFolder?.subFolders || [];
  const residualDossiers = shipmentsFolder?.subFolders.find(f => f.name === 'Residuals')?.subFolders || [];

  const handleNewFolderClick = (target: Folder | undefined) => {
    if (target) {
        setNewFolderTarget(target);
        setIsNewFolderOpen(true);
    }
  }

  return (
    <>
      {isMobile && (
        <div className="flex items-center p-4 border-b gap-4">
            {/* FIX: The Button component requires children. Added MenuIcon as a child. */}
            <Button onClick={onMenuClick} variant="secondary" className="!p-2 !h-10 !w-10">
                <MenuIcon />
            </Button>
            <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
      )}
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {!isMobile && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            {!searchQuery && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* FIX: The Button component requires children. Added text and an icon. */}
                <Button onClick={() => setIsUploadOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                {/* FIX: The Button component requires children. Added text and an icon. */}
                <Button variant="secondary" onClick={() => handleNewFolderClick(clientsFolder)}>
                    <FolderPlus className="mr-2 h-4 w-4" /> New Client
                </Button>
                {/* FIX: The Button component requires children. Added text and an icon. */}
                <Button variant="secondary" onClick={() => handleNewFolderClick(suppliersFolder)}>
                    <FolderPlus className="mr-2 h-4 w-4" /> New Supplier
                </Button>
                {/* FIX: The Button component requires children. Added text and an icon. */}
                <Button variant="secondary" onClick={() => handleNewFolderClick(containerFolder)}>
                    <FolderPlus className="mr-2 h-4 w-4" /> New Container
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search all files and folders and press Enter..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10"
          />
        </div>

        {searchQuery ? (
          <SearchResults 
            results={searchResults}
            onResultClick={onResultClick}
            onClearSearch={onClearSearch}
          />
        ) : (
          <>
            {(showBackendTodo || showDeployGuide) && (
               <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                 <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Developer To-Do List</h3>
                    <div className="space-y-4">
                      {showBackendTodo && (
                        <details className="group border-b border-border pb-4">
                            <summary className="cursor-pointer list-none flex items-center justify-between text-md font-medium text-foreground">
                                <span className="pr-2">1. Backend Specification for GitHub Copilot</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* FIX: The Button component requires children. Added button text. */}
                                  <Button variant="secondary" onClick={(e) => {e.preventDefault(); handleCopy(backendSpecContent)}} className="h-8 px-2 py-1 text-xs">{copyButtonText}</Button>
                                  {/* FIX: The Button component requires children. Added Trash2 icon as a child. */}
                                  <Button variant="secondary" onClick={(e) => {e.preventDefault(); setShowBackendTodo(false)}} className="h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                                  <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
                                </div>
                            </summary>
                            <div className="mt-4 relative bg-muted/50 p-4 rounded-md">
                                <pre className="whitespace-pre-wrap text-xs text-muted-foreground max-h-60 overflow-y-auto font-mono">
                                    <code>{backendSpecContent.trim()}</code>
                                </pre>
                            </div>
                        </details>
                      )}
                      {showDeployGuide && (
                        <details className="group">
                            <summary className="cursor-pointer list-none flex items-center justify-between text-md font-medium text-foreground">
                                <span className="pr-2">2. Deployment & Integration Guide</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* FIX: The Button component requires children. Added button text. */}
                                  <Button variant="secondary" onClick={(e) => {e.preventDefault(); handleCopy(deploymentGuideContent)}} className="h-8 px-2 py-1 text-xs">{copyButtonText}</Button>
                                  {/* FIX: The Button component requires children. Added Trash2 icon as a child. */}
                                  <Button variant="secondary" onClick={(e) => {e.preventDefault(); setShowDeployGuide(false)}} className="h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                                  <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
                                </div>
                            </summary>
                            <div className="mt-4 relative bg-muted/50 p-4 rounded-md">
                                <pre className="whitespace-pre-wrap text-xs text-muted-foreground max-h-60 overflow-y-auto font-mono">
                                    <code>{deploymentGuideContent.trim()}</code>
                                </pre>
                            </div>
                        </details>
                      )}
                    </div>
                 </div>
               </div>
            )}

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Expiring Certificates (Next 4 Weeks)
                </h3>
              </div>
              <div className="p-6 pt-0">
                {expiringCertificates.length > 0 ? (
                  isSmallScreen ? (
                     <div className="space-y-2">
                        {expiringCertificates.map(file => (
                          <div key={file.id} className="p-3 border rounded-md">
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">{file.supplierName}</p>
                              <p className="text-sm text-destructive font-medium mt-1">
                                  Expires: {format(parse(file.expirationDate!, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy')}
                              </p>
                          </div>
                        ))}
                     </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full caption-bottom text-sm">
                          <thead className="[&_tr]:border-b">
                              <tr className="border-b transition-colors hover:bg-muted/50">
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">File Name</th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Supplier</th>
                                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Expires On</th>
                              </tr>
                          </thead>
                          <tbody className="[&_tr:last-child]:border-0">
                          {expiringCertificates.map(file => (
                            <tr key={file.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle">{file.name}</td>
                              <td className="p-4 align-middle">{file.supplierName}</td>
                              <td className="p-4 text-right text-destructive font-medium">
                                {format(parse(file.expirationDate!, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <p className="text-center text-muted-foreground py-8">No certificates expiring soon.</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                      <Ship className="h-5 w-5 text-primary" /> Container Shipments
                  </h3>
                </div>
                <div className="p-6 pt-0">
                  {containerDossiers.length > 0 ? (
                    isSmallScreen ? (
                      <div className="space-y-2">
                        {containerDossiers.map(dossier => (
                           <div key={dossier.id} className="p-3 border rounded-md cursor-pointer hover:bg-muted/50" onClick={() => onNavigate(dossier.id)}>
                             <div className="flex justify-between items-start">
                               <div>
                                  <p className="font-medium">{dossier.name}</p>
                                  <p className="text-sm text-muted-foreground">{dossier.clientName} / {dossier.supplierName}</p>
                               </div>
                               <DossierStatusIcons dossier={dossier} type="Container" />
                             </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b"><tr className="border-b transition-colors hover:bg-muted/50"><th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dossier</th><th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Client</th><th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Supplier</th><th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th></tr></thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {containerDossiers.map(dossier => (
                                <tr key={dossier.id} className="cursor-pointer border-b transition-colors hover:bg-muted/50" onClick={() => onNavigate(dossier.id)}>
                                    <td className="p-4 align-middle font-medium">{dossier.name}</td><td className="p-4 align-middle">{dossier.clientName}</td><td className="p-4 align-middle">{dossier.supplierName}</td><td className="p-4 align-middle"><DossierStatusIcons dossier={dossier} type="Container" /></td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                      <p className="text-center text-muted-foreground py-8">No container shipments found.</p>
                  )}
                </div>
              </div>
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                      <Box className="h-5 w-5 text-primary" /> Residuals Shipments
                  </h3>
                </div>
                <div className="p-6 pt-0">
                  {residualDossiers.length > 0 ? (
                    isSmallScreen ? (
                       <div className="space-y-2">
                        {residualDossiers.map(dossier => (
                           <div key={dossier.id} className="p-3 border rounded-md cursor-pointer hover:bg-muted/50" onClick={() => onNavigate(dossier.id)}>
                             <div className="flex justify-between items-start">
                               <div>
                                  <p className="font-medium">{dossier.name}</p>
                                  <p className="text-sm text-muted-foreground">{dossier.clientName} / {dossier.supplierName}</p>
                               </div>
                               <DossierStatusIcons dossier={dossier} type="Residuals" />
                             </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b"><tr className="border-b transition-colors hover:bg-muted/50"><th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dossier</th><th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Client</th><th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Supplier</th><th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th></tr></thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {residualDossiers.map(dossier => (
                                <tr key={dossier.id} className="cursor-pointer border-b transition-colors hover:bg-muted/50" onClick={() => onNavigate(dossier.id)}>
                                    <td className="p-4 align-middle font-medium">{dossier.name}</td><td className="p-4 align-middle">{dossier.clientName}</td><td className="p-4 align-middle">{dossier.supplierName}</td><td className="p-4 align-middle"><DossierStatusIcons dossier={dossier} type="Residuals" /></td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                      <p className="text-center text-muted-foreground py-8">No residual shipments found.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <UploadDialog
          isOpen={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onUpload={onAddFile}
          currentFolder={rootFolder} 
          rootFolder={rootFolder}
          path={[]}
        />
        {newFolderTarget && <NewFolderDialog
          isOpen={isNewFolderOpen}
          onOpenChange={setIsNewFolderOpen}
          onAddFolder={onAddFolder}
          rootFolder={rootFolder}
          currentFolder={newFolderTarget}
        />}
    </>
  );
}