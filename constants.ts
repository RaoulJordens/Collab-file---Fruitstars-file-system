import type { Folder, Label } from './types';

export const allLabels: Label[] = [
  { id: 'l-c-1', name: 'Sales agreement', color: 'blue', category: 'Client' },
  { id: 'l-c-2', name: 'Company profile', color: 'blue', category: 'Client' },
  { id: 'l-s-1', name: 'Supplier declaration', color: 'green', category: 'Supplier' },
  { id: 'l-s-2', name: 'Purchase agreement', color: 'green', category: 'Supplier' },
  { id: 'l-s-3', name: 'Product specification', color: 'green', category: 'Supplier' },
  { id: 'l-s-4', name: 'Company profile', color: 'green', category: 'Supplier' },
  { id: 'l-s-5', name: 'GlobalGap (DATE)', color: 'orange', category: 'Supplier' },
  { id: 'l-s-6', name: 'Grasp (DATE)', color: 'orange', category: 'Supplier' },
  { id: 'l-s-7', name: 'SMETA (DATE)', color: 'orange', category: 'Supplier' },
  { id: 'l-sh-c-1', name: 'Order confirmation', color: 'red', category: 'Shipment' },
  { id: 'l-sh-c-2', name: 'Bill of Loading', color: 'red', category: 'Shipment' },
  { id: 'l-sh-c-3', name: 'Packinglist', color: 'red', category: 'Shipment' },
  { id: 'l-sh-c-4', name: 'Supplier Invoice', color: 'yellow', category: 'Shipment' },
  { id: 'l-sh-c-5', name: 'Draft Phyto', color: 'purple', category: 'Shipment' },
  { id: 'l-sh-c-6', name: 'Phyto', color: 'purple', category: 'Shipment' },
  { id: 'l-sh-c-7', name: 'Waybill', color: 'red', category: 'Shipment' },
  { id: 'l-sh-c-8', name: 'Stamped Phyto', color: 'purple', category: 'Shipment' },
  { id: 'l-sh-c-9', name: 'Telex release', color: 'red', category: 'Shipment' },
  { id: 'l-sh-c-10', name: 'Sales advance invoice', color: 'yellow', category: 'Shipment' },
  { id: 'l-sh-c-11', name: 'Quality reports', color: 'pink', category: 'Shipment' },
  { id: 'l-sh-c-12', name: 'Client settlement', color: 'yellow', category: 'Shipment' },
  { id: 'l-sh-c-13', name: 'Sales invoice', color: 'yellow', category: 'Shipment' },
  { id: 'l-sh-c-14', name: 'Internal invoice', color: 'yellow', category: 'Shipment' },
  { id: 'l-sh-cost-1', name: 'Transport costs', color: 'yellow', category: 'Shipment' },
  { id: 'l-sh-cost-2', name: 'THC costs', color: 'yellow', category: 'Shipment' },
  { id: 'l-sh-cost-3', name: 'Other costs', color: 'yellow', category: 'Shipment' },
  { id: 'l-o-1', name: 'Other', color: 'blue', category: 'General' },
];

export const initialData: Folder = {
  id: 'root',
  name: 'Dashboard',
  collaborators: [],
  files: [],
  subFolders: [
    {
      id: 'f1',
      name: 'Clients',
      collaborators: [],
      files: [],
      subFolders: [{
        id: 'f1-1', name: 'Client A', files: [], collaborators: [], subFolders: []
      }],
    },
    {
      id: 'f2',
      name: 'Suppliers',
      collaborators: [],
      files: [],
      subFolders: [{
        id: 'f2-1', name: 'Supplier X', files: [
            { id: 'file-exp-1', name: 'GlobalGap Cert.pdf', type: 'PDF', size: '1.2 MB', lastModified: '2023-10-15', labels: [allLabels[4]], previewUrl: 'https://picsum.photos/seed/cert1/400/300', expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        ], collaborators: [], subFolders: []
      }],
    },
    {
      id: 'f4',
      name: 'Products',
      collaborators: [],
      files: [],
      subFolders: [{
        id: 'f4-1', name: 'Avocado', files: [], collaborators: [], subFolders: []
      }],
    },
    {
      id: 'f5',
      name: 'Procedures',
      collaborators: [],
      files: [],
      subFolders: [
        { id: 'f5-1', name: 'Forms', files: [], collaborators: [], subFolders: [] },
        { id: 'f5-2', name: 'Lists', files: [], collaborators: [], subFolders: [] },
        { id: 'f5-3', name: 'Standard operating procedures', files: [], collaborators: [], subFolders: [] },
        { id: 'f5-4', name: 'Templates', files: [], collaborators: [], subFolders: [] },
      ],
    },
    {
      id: 'f3',
      name: 'Shipments',
      collaborators: [],
      files: [],
      subFolders: [
        {
          id: 'f3-1',
          name: 'Container',
          files: [],
          collaborators: [],
          subFolders: [
            { id: 'f3-1-1', name: '26525 / 200', files: [], collaborators: [], subFolders: [], clientId: 'f1-1', supplierId: 'f2-1', clientName: 'Client A', supplierName: 'Supplier X', invoiceNumber: '26525', batchNumber: '200' }
          ],
        },
        {
          id: 'f3-2',
          name: 'Residuals',
          files: [],
          collaborators: [],
          subFolders: [],
        }
      ],
    },
  ],
};

export const findFolderById = (folder: Folder, id: string): Folder | null => {
  if (folder.id === id) {
    return folder;
  }
  for (const subFolder of folder.subFolders) {
    const found = findFolderById(subFolder, id);
    if (found) {
      return found;
    }
  }
  return null;
};

export const findParentFolder = (root: Folder, fileId: string): Folder | null => {
  if (root.files.some(f => f.id === fileId)) {
    return root;
  }
  for (const subFolder of root.subFolders) {
    const found = findParentFolder(subFolder, fileId);
    if (found) {
      return found;
    }
  }
  return null;
}

export const getAllFolderNames = (folder: Folder): string[] => {
  let names = [folder.name];
  for (const subFolder of folder.subFolders) {
    names = names.concat(getAllFolderNames(subFolder));
  }
  return names;
}