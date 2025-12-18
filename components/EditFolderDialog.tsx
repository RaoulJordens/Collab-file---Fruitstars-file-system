

import React, { useState, useMemo, useEffect } from 'react';
import type { Folder } from '../types';
import { Dialog, Button, Input, Select, FormField } from './UI';

interface EditFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
  rootFolder: Folder;
  currentFolder: Folder;
}

export function EditFolderDialog({ isOpen, onOpenChange, onUpdateFolder, rootFolder, currentFolder }: EditFolderDialogProps) {
    const [folderName, setFolderName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [batchNumber, setBatchNumber] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | undefined>('');
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>('');
    const [isSaving, setIsSaving] = useState(false);

    const isShipmentFolder = useMemo(() => {
        const findParent = (root: Folder, childId: string): Folder | null => {
            for (const sub of root.subFolders) {
                if (sub.id === childId) return root;
                const found = findParent(sub, childId);
                if (found) return found;
            }
            return null;
        };
        const parent = findParent(rootFolder, currentFolder.id);
        return parent?.name === 'Container' || parent?.name === 'Residuals';
    }, [rootFolder, currentFolder]);

    const clients = useMemo(() => rootFolder.subFolders.find(f => f.name === 'Clients')?.subFolders || [], [rootFolder]);
    const suppliers = useMemo(() => rootFolder.subFolders.find(f => f.name === 'Suppliers')?.subFolders || [], [rootFolder]);

    useEffect(() => {
        if (currentFolder && isOpen) {
            setFolderName(currentFolder.name);
            setInvoiceNumber(currentFolder.invoiceNumber || '');
            setBatchNumber(currentFolder.batchNumber || '');
            setSelectedClientId(currentFolder.clientId);
            setSelectedSupplierId(currentFolder.supplierId);
        }
    }, [currentFolder, isOpen]);

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            if (isShipmentFolder) {
                if (!invoiceNumber.trim() || !batchNumber.trim() || !selectedClientId || !selectedSupplierId) {
                    alert('Please fill all dossier details.');
                    setIsSaving(false);
                    return;
                }
                const updatedName = `${invoiceNumber} / ${batchNumber}`;
                const updates = { name: updatedName, invoiceNumber, batchNumber, clientId: selectedClientId, supplierId: selectedSupplierId };
                await onUpdateFolder(currentFolder.id, updates);
            } else {
                 if (!folderName.trim()) {
                    alert('Folder name is required.');
                    setIsSaving(false);
                    return;
                }
                await onUpdateFolder(currentFolder.id, { name: folderName });
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update folder:", error);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        // FIX: The Dialog component requires children. Added dialog content as children.
        <Dialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Edit"
            description={isShipmentFolder ? "Update the details for this dossier." : "Update the folder name."}
        >
          <>
            <div className="mt-4 space-y-4">
                {!isShipmentFolder ? (
                    // FIX: The FormField component requires children. Added the Input component as a child.
                    <FormField label="Name">
                        <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} />
                    </FormField>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            {/* FIX: The FormField component requires children. Added the Input component as a child. */}
                            <FormField label="Invoice Number">
                                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                            </FormField>
                            {/* FIX: The FormField component requires children. Added the Input component as a child. */}
                            <FormField label="Batch Number">
                                <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
                            </FormField>
                        </div>
                        {/* FIX: The FormField component requires children. Added the Select component as a child. */}
                        <FormField label="Client">
                            {/* FIX: The Select component requires children. Added option elements as children. */}
                            <Select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                                <option value="">Select client...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </FormField>
                        {/* FIX: The FormField component requires children. Added the Select component as a child. */}
                        <FormField label="Supplier">
                            {/* FIX: The Select component requires children. Added option elements as children. */}
                            <Select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)}>
                                <option value="">Select supplier...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Select>
                        </FormField>
                    </>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
                {/* FIX: The Button component requires children. Added text content. */}
                <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
                {/* FIX: The Button component requires children. Added text content. */}
                <Button onClick={handleUpdate} disabled={isSaving} isLoading={isSaving}>Save Changes</Button>
            </div>
          </>
        </Dialog>
    );
}