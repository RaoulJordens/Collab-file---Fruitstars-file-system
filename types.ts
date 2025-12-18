
export type Label = {
  id: string;
  name: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'pink';
  category: 'Client' | 'Supplier' | 'Shipment' | 'General';
};

export type Collaborator = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'View' | 'Edit' | 'Owner';
};

export type File = {
  id: string;
  name: string;
  type: 'Image' | 'PDF' | 'Document';
  size: string;
  lastModified: string;
  labels: Label[];
  previewUrl: string;
  expirationDate?: string;
  invoiceNumber?: string;
  content?: string;
};

export type Folder = {
  id: string;
  name: string;
  files: File[];
  collaborators: Collaborator[];
  subFolders: Folder[];
  clientId?: string;
  supplierId?: string;
  clientName?: string;
  supplierName?: string;
  productIds?: string[];
  productNames?: string[];
  invoiceNumber?: string;
  batchNumber?: string;
  containerNumber?: string;
  shippingLine?: string;
  vessel?: string;
  orderReference?: string;
  destinationPort?: string;
};

export type SearchResultItem = {
  item: File | Folder;
  path: string;
};
