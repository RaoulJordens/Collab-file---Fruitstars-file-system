

import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import type { File as AppFile, Folder } from '../types';
import { allLabels } from '../constants';
import { Dialog, Button, Select, Input, FormField, Listbox } from './UI';
import { suggestFilePlacement } from '../services/geminiService';

type UploadableFile = Omit<AppFile, 'id' | 'lastModified' | 'previewUrl'>;

interface UploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpload: (targetFolderId: string, newFile: UploadableFile) => Promise<void>;
  rootFolder: Folder;
  currentFolder: Folder;
  path: Folder[];
  initialFile?: globalThis.File | null;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getAppFileType(fileType: string): 'Image' | 'PDF' | 'Document' {
  if (fileType.startsWith('image/')) return 'Image';
  if (fileType === 'application/pdf') return 'PDF';
  return 'Document';
}

export function UploadDialog({ isOpen, onOpenChange, onUpload, rootFolder, currentFolder, path, initialFile }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [category, setCategory] = useState('');
  const [destination, setDestination] = useState('');
  const [shipmentType, setShipmentType] = useState('');
  const [dossier, setDossier] = useState('');
  const [fileType, setFileType] = useState('');
  const [dossierSearch, setDossierSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);


  const resetState = () => {
    setSelectedFile(null);
    setCategory('');
    setDestination('');
    setShipmentType('');
    setDossier('');
    setFileType('');
    setDossierSearch('');
  };

  useEffect(() => {
    if (isOpen) {
       if (initialFile) {
        setSelectedFile(initialFile);
      }
      if (currentFolder && path.length > 0) {
        const categoryFolder = path.length > 1 ? path[1] : currentFolder;
        if (categoryFolder) {
          setCategory(categoryFolder.name);

          if (categoryFolder.name === 'Shipments') {
            if (path.length > 2) {
              const shipmentTypeFolder = path[2];
              setShipmentType(shipmentTypeFolder.name);
              if (path.length > 3) {
                setDossier(currentFolder.id);
              }
            }
          } else { 
            if (currentFolder.id !== categoryFolder.id) {
              setDestination(currentFolder.id);
            } else if (path.length === 1 && currentFolder.id !== 'root') {
               setCategory(currentFolder.name);
            }
          }
        }
      }
    } else {
      resetState();
    }
  }, [isOpen, currentFolder, path, initialFile]);

  const destinationOptions = useMemo(() => {
    if (!category || category === 'Shipments') return [];
    const catFolder = rootFolder.subFolders.find(f => f.name === category);
    return catFolder?.subFolders || [];
  }, [category, rootFolder]);

  const dossierOptions = useMemo(() => {
    if (category !== 'Shipments' || !shipmentType) return [];
    const typeFolder = rootFolder.subFolders.find(f => f.name === 'Shipments')?.subFolders.find(sf => sf.name === shipmentType);
    const dossiers = typeFolder?.subFolders || [];
    if (!dossierSearch) return dossiers;
    return dossiers.filter(d => d.name.toLowerCase().includes(dossierSearch.toLowerCase()));
  }, [category, shipmentType, rootFolder, dossierSearch]);
  
  const fileTypeOptions = useMemo(() => {
    const general = allLabels.filter(l => l.name === 'Other');
    if (!category) return general;

    switch (category) {
      case 'Clients':
        return [...allLabels.filter(l => ['Sales agreement', 'Company profile'].includes(l.name)), ...general];
      case 'Suppliers':
        return [...allLabels.filter(l => ['Supplier declaration', 'Purchase agreement', 'Product specification', 'Company profile', 'GlobalGap (DATE)', 'Grasp (DATE)', 'SMETA (DATE)'].includes(l.name)), ...general];
      case 'Procedures':
        return general;
      case 'Shipments':
        if (shipmentType === 'Container') {
            return [
                ...allLabels.filter(l => ['Bill of Loading', 'Packinglist', 'Supplier Invoice', 'Phyto', 'Waybill', 'Telex release', 'Sales advance invoice', 'Sales invoice', 'Client settlement', 'Quality reports'].includes(l.name)),
                ...allLabels.filter(l => l.category === 'Shipment' && l.name.includes('costs')),
                ...general
            ];
        }
        if (shipmentType === 'Residuals') {
            return [
                ...allLabels.filter(l => ['Bill of Loading', 'Supplier Invoice', 'Internal invoice', 'Client settlement', 'Sales invoice'].includes(l.name)),
                ...allLabels.filter(l => l.category === 'Shipment' && l.name.includes('costs')),
                ...general
            ];
        }
        return [];
      default:
        return [];
    }
  }, [category, shipmentType]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file as globalThis.File);
    else setSelectedFile(null);
  };

  const handleGetSuggestion = async () => {
    if (!selectedFile) return;
    setIsSuggesting(true);
    try {
        const { suggestedFolderId, suggestedLabel } = await suggestFilePlacement(
            selectedFile.name,
            selectedFile.type,
            rootFolder
        );

        if (suggestedLabel) {
            setFileType(suggestedLabel.id);
        }

        if (suggestedFolderId) {
            const findPathToFolder = (root: Folder, id: string, currentPath: Folder[]): Folder[] | null => {
                const newPath = [...currentPath, root];
                if (root.id === id) return newPath;
                for (const sub of root.subFolders) {
                    const foundPath = findPathToFolder(sub, id, newPath);
                    if (foundPath) return foundPath;
                }
                return null;
            }

            const folderPath = findPathToFolder(rootFolder, suggestedFolderId, []);
            if (folderPath && folderPath.length > 1) {
                const suggestedCategory = folderPath[1];
                setCategory(suggestedCategory.name);

                if (suggestedCategory.name === 'Shipments') {
                    if (folderPath.length > 2) {
                        setShipmentType(folderPath[2].name);
                    }
                    if (folderPath.length > 3) {
                        setDossier(folderPath[3].id);
                    }
                } else {
                    if (folderPath.length > 2) {
                        setDestination(folderPath[2].id);
                    } else {
                        setDestination(''); // It's a root category folder
                    }
                }
            }
        }
    } catch (error) {
        console.error("Failed to get AI suggestion:", error);
        alert("Could not get AI suggestion. Please classify the file manually.");
    } finally {
        setIsSuggesting(false);
    }
  };
  
  const handleUpload = async () => {
    let targetFolderId = '';
    if (category === 'Shipments') {
        if (!dossier) { alert("Please select a dossier."); return; }
        targetFolderId = dossier;
    } else {
        if (!destination && category) {
          const categoryFolder = rootFolder.subFolders.find(f => f.name === category);
          if (categoryFolder) targetFolderId = categoryFolder.id;
        } else if (destination) {
          targetFolderId = destination;
        }

        if(!targetFolderId) {
           alert("Please select a destination folder."); return; 
        }
    }
    
    if (!selectedFile || !fileType) {
        alert("Please select a file and a file type.");
        return;
    }
    
    setIsUploading(true);

    const selectedLabel = allLabels.find(l => l.id === fileType);
    const newFile: UploadableFile = {
        name: selectedFile.name,
        size: formatBytes(selectedFile.size),
        type: getAppFileType(selectedFile.type),
        labels: selectedLabel ? [selectedLabel] : [],
    }

    try {
        await onUpload(targetFolderId, newFile);
        onOpenChange(false);
    } catch(error) {
        console.error("Upload failed", error);
        alert("Upload failed. Please try again.");
    } finally {
        setIsUploading(false);
    }
  };

  const isFileTypeDisabled = !( (category && category !== 'Shipments' && (destination || ['f1', 'f2', 'f4', 'f5'].includes(rootFolder.subFolders.find(f => f.name === category)?.id || ''))) || (category === 'Shipments' && dossier) );

  return (
    // FIX: The Dialog component requires children. Added dialog content as children.
    <Dialog 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        title="Upload File"
        description="Select a file and classify it, or use AI to suggest a placement."
    >
      <>
        <div className="mt-4 space-y-4">
            {/* FIX: The FormField component requires children. Added input and file details as children. */}
            <FormField label="File">
              <>
                <input type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-muted/80"/>
                {selectedFile && (
                    <div className="text-sm text-muted-foreground space-y-1 pt-2">
                        <p><span className="font-semibold">File Name:</span> {selectedFile.name}</p>
                        <p><span className="font-semibold">File Size:</span> {formatBytes(selectedFile.size)}</p>
                    </div>
                )}
              </>
            </FormField>
            
            <div className='text-center my-4'>
                {/* FIX: The Button component requires children. Added text child. */}
                <Button variant='secondary' onClick={handleGetSuggestion} disabled={!selectedFile || isSuggesting} isLoading={isSuggesting}>
                    Suggest Placement with AI
                </Button>
            </div>

            {/* FIX: The FormField component requires children. Added Select component as a child. */}
            <FormField label="Category">
                {/* FIX: The Select component requires children. Added option elements as children. */}
                <Select value={category} onChange={e => { setCategory(e.target.value); setDestination(''); setShipmentType(''); setDossier(''); setFileType(''); }}>
                    <option value="">Select Category...</option>
                    <option value="Clients">Clients</option>
                    <option value="Suppliers">Suppliers</option>
                    <option value="Shipments">Shipments</option>
                    <option value="Procedures">Procedures</option>
                </Select>
            </FormField>

            {category && category !== 'Shipments' && (
                // FIX: The FormField component requires children. Added Select component as a child.
                <FormField label="Destination">
                    {/* FIX: The Select component requires children. Added option elements as children. */}
                    <Select value={destination} onChange={e => setDestination(e.target.value)} disabled={destinationOptions.length === 0}>
                        <option value="">Select Destination...</option>
                        {destinationOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Select>
                </FormField>
            )}

            {category === 'Shipments' && (
                <>
                    {/* FIX: The FormField component requires children. Added Select component as a child. */}
                    <FormField label="Shipment Type">
                        {/* FIX: The Select component requires children. Added option elements as children. */}
                        <Select value={shipmentType} onChange={e => { setShipmentType(e.target.value); setDossier(''); }}>
                            <option value="">Select Type...</option>
                            <option value="Container">Container</option>
                            <option value="Residuals">Residuals</option>
                        </Select>
                    </FormField>

                    {shipmentType && (
                        // FIX: The FormField component requires children. Added Input and Listbox as children.
                        <FormField label="Dossier">
                          <>
                            <Input type="text" placeholder="Search for a dossier..." value={dossierSearch} onChange={e => setDossierSearch(e.target.value)} />
                            {/* FIX: The Listbox component requires children. Added option elements as children. */}
                            <Listbox value={dossier} onChange={e => setDossier(e.target.value)}>
                                {dossierOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </Listbox>
                          </>
                        </FormField>
                    )}
                </>
            )}
            
            {/* FIX: The FormField component requires children. Added Select component as a child. */}
            <FormField label="File Type">
                {/* FIX: The Select component requires children. Added option elements as children. */}
                <Select value={fileType} onChange={e => setFileType(e.target.value)} disabled={isFileTypeDisabled}>
                    <option value="">Select file type...</option>
                    {fileTypeOptions.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
            </FormField>

        </div>
        <div className="mt-6 flex justify-end gap-2">
          {/* FIX: The Button component requires children. Added text child. */}
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isUploading}>Cancel</Button>
          {/* FIX: The Button component requires children. Added text child. */}
          <Button onClick={handleUpload} disabled={!selectedFile || !fileType || isUploading} isLoading={isUploading}>
            Upload
          </Button>
        </div>
      </>
    </Dialog>
  );
}