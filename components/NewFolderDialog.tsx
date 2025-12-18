

import React, { useState, useMemo } from 'react';
import type { Folder } from '../types';
import { Dialog, Button, Input, Select, FormField } from './UI';

interface NewFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddFolder: (parentId: string, folderName: string, details: Partial<Folder>) => Promise<void>;
  rootFolder: Folder;
  currentFolder: Folder;
}

export function NewFolderDialog({ isOpen, onOpenChange, onAddFolder, rootFolder, currentFolder }: NewFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const isShipmentFolder = currentFolder.name === 'Container' || currentFolder.name === 'Residuals';
  const clients = useMemo(() => rootFolder.subFolders.find(f => f.name === 'Clients')?.subFolders || [], [rootFolder]);
  const suppliers = useMemo(() => rootFolder.subFolders.find(f => f.name === 'Suppliers')?.subFolders || [], [rootFolder]);

  const handleAdd = async () => {
    setIsCreating(true);
    try {
      if (isShipmentFolder) {
        if (!invoiceNumber.trim() || !batchNumber.trim() || !selectedClientId || !selectedSupplierId) {
          alert('Please fill all dossier details.');
          setIsCreating(false);
          return;
        }
        const newDossierName = `${invoiceNumber} / ${batchNumber}`;
        const details = { clientId: selectedClientId, supplierId: selectedSupplierId, invoiceNumber, batchNumber };
        await onAddFolder(currentFolder.id, newDossierName, details);
      } else {
        if (!folderName.trim()) {
          alert('Folder name is required.');
          setIsCreating(false);
          return;
        }
        await onAddFolder(currentFolder.id, folderName, {});
      }
      handleDialogClose(false);
    } catch(err) {
      console.error("Failed to add folder", err);
      alert("An error occurred. Please try again.");
    } finally {
        setIsCreating(false);
    }
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setFolderName('');
      setInvoiceNumber('');
      setBatchNumber('');
      setSelectedClientId('');
      setSelectedSupplierId('');
    }
    onOpenChange(open);
  };
  
  return (
    // FIX: The Dialog component requires children. Added dialog content as children.
    <Dialog
        isOpen={isOpen}
        onOpenChange={handleDialogClose}
        title="Create New"
        description={isShipmentFolder ? "Enter details for the new dossier." : "Enter a name for the new folder."}
    >
      <>
        <div className="mt-4 space-y-4">
            {!isShipmentFolder ? (
                // FIX: The FormField component requires children. Added the Input component as a child.
                <FormField label="Name">
                    <Input 
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        placeholder="Folder name"
                    />
                </FormField>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        {/* FIX: The FormField component requires children. Added the Input component as a child. */}
                        <FormField label="Invoice Number">
                            <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                        </FormField>
                        {/* FIX: The FormField component requires children. Added the Input component as a child. */}
                        <FormField label="Batch Number">
                            <Input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} />
                        </FormField>
                    </div>
                    {/* FIX: The FormField component requires children. Added the Select component as a child. */}
                    <FormField label="Client">
                        {/* FIX: The Select component requires children. Added option elements as children. */}
                        <Select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                        <option value="">Select client...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>
                    {/* FIX: The FormField component requires children. Added the Select component as a child. */}
                    <FormField label="Supplier">
                        {/* FIX: The Select component requires children. Added option elements as children. */}
                        <Select value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)}>
                        <option value="">Select supplier...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </FormField>
                </>
            )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
            {/* FIX: The Button component requires children. Added text content. */}
            <Button variant="secondary" onClick={() => handleDialogClose(false)} disabled={isCreating}>Cancel</Button>
            {/* FIX: The Button component requires children. Added text content. */}
            <Button onClick={handleAdd} disabled={isCreating} isLoading={isCreating}>Create</Button>
        </div>
      </>
    </Dialog>
  );
}