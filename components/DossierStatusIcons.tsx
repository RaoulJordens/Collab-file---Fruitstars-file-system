
import React from 'react';
import type { Folder } from '../types';
import { Ship, Box, FileCheck, Anchor, Package, Receipt, Leaf, Truck, DollarSign, FileIcon as FileIcon, Building, FileText, Handshake, Users, ClipboardList, Globe } from './Icons';

const clientKeyFiles = [
    { name: 'Sales agreement', icon: FileText },
    { name: 'Company profile', icon: Building },
];

const supplierKeyFiles = [
    { name: 'Supplier declaration', icon: FileCheck },
    { name: 'Purchase agreement', icon: FileText },
    { name: 'Product specification', icon: ClipboardList },
    { name: 'Company profile', icon: Building },
    { name: 'GlobalGap (DATE)', icon: Globe },
    { name: 'Grasp (DATE)', icon: Handshake },
    { name: 'SMETA (DATE)', icon: Users },
];

const containerKeyFiles = [
  { name: 'Order confirmation', icon: FileCheck },
  { name: 'Bill of Loading', icon: Anchor },
  { name: 'Packinglist', icon: Package },
  { name: 'Supplier Invoice', icon: Receipt },
  { name: 'Phyto', icon: Leaf },
  { name: 'Waybill', icon: Truck },
];

const residualsKeyFiles = [
  { name: 'Order confirmation', icon: FileCheck },
  { name: 'Supplier Invoice', icon: Receipt },
  { name: 'Sales invoice', icon: DollarSign },
];

interface DossierStatusIconsProps {
    dossier: Folder;
    type: 'Container' | 'Residuals' | 'Client' | 'Supplier';
}

export function DossierStatusIcons({ dossier, type }: DossierStatusIconsProps) {
    const getKeyFiles = () => {
        switch (type) {
            case 'Container': return containerKeyFiles;
            case 'Residuals': return residualsKeyFiles;
            case 'Client': return clientKeyFiles;
            case 'Supplier': return supplierKeyFiles;
            default: return [];
        }
    }
    
    const keyFiles = getKeyFiles();
    const uploadedFileLabels = new Set(dossier.files.flatMap(file => file.labels.map(label => label.name)));

    return (
      <div className="flex items-center gap-2">
        {keyFiles.map(({name, icon: Icon}) => {
            const isUploaded = uploadedFileLabels.has(name);
            return (
                <div key={name} className="relative group">
                    <Icon className={`h-4 w-4 ${isUploaded ? 'text-green-500' : 'text-gray-300'}`} />
                    <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       {name}{!isUploaded && " (Missing)"}
                    </div>
                </div>
            );
        })}
      </div>
    )
}
