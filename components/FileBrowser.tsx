
import React, { useState, useMemo } from 'react';
import { FolderIcon, FileIcon as DefaultFileIcon, CalendarIcon, ArrowUp, ArrowDown, ChevronRight } from './Icons';
import { FileActions } from './FileActions';
import { FolderActions } from './FolderActions';
import type { File, Folder, Label } from '../types';
import { parse, isPast, isToday, format } from 'date-fns';
import { DossierStatusIcons } from './DossierStatusIcons';
import { Input } from './UI';
import { useMediaQuery } from '../hooks/useMediaQuery';

type SortKey = 'name' | 'lastModified';
type SortDirection = 'asc' | 'desc';

const labelColors: { [key: string]: string } = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
};

interface FileBrowserProps {
  currentFolder: Folder;
  rootFolder: Folder;
  path: Folder[];
  onFolderClick: (folderId: string) => void;
  onAddLabel: (fileId: string, label: Label) => Promise<void>;
  onMoveFile: (fileId: string, targetFolderId: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  canEdit: boolean;
}

const getFileIcon = (file: File) => {
    switch (file.type) {
      case 'Image':
        return <img src={file.previewUrl} alt={file.name} className="h-10 w-10 rounded-md object-cover flex-shrink-0" />;
      case 'PDF':
        return <DefaultFileIcon className="h-10 w-10 text-red-500 flex-shrink-0" />;
      case 'Document':
        return <DefaultFileIcon className="h-10 w-10 text-blue-500 flex-shrink-0" />;
      default:
        return <DefaultFileIcon className="h-10 w-10 text-muted-foreground flex-shrink-0" />;
    }
};

const getExpirationStatusColor = (dateString: string) => {
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    if (isPast(date) || isToday(date)) return "text-destructive";
    return "text-muted-foreground";
}

const SortableHeader = ({ children, sortKey, currentSort, onSort }: { children?: React.ReactNode, sortKey: SortKey, currentSort: {key: SortKey, dir: SortDirection}, onSort: (key: SortKey) => void }) => (
    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => onSort(sortKey)}>
        <div className="flex items-center gap-2">
            {children}
            {currentSort.key === sortKey && (currentSort.dir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
        </div>
    </th>
);

export function FileBrowser({ currentFolder, rootFolder, path, onFolderClick, onAddLabel, onMoveFile, onDeleteFile, onDeleteFolder, canEdit }: FileBrowserProps) {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<{key: SortKey, dir: SortDirection}>({key: 'name', dir: 'asc'});
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleSort = (key: SortKey) => {
    setSort(prev => ({
        key,
        dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedItems = useMemo(() => {
    const items = [...currentFolder.subFolders, ...currentFolder.files]
        .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));

    items.sort((a, b) => {
        if (sort.key === 'lastModified') {
            const dateA = 'lastModified' in a ? parse(a.lastModified, 'MM/dd/yyyy', new Date()).getTime() : 0;
            const dateB = 'lastModified' in b ? parse(b.lastModified, 'MM/dd/yyyy', new Date()).getTime() : 0;
            return sort.dir === 'asc' ? dateA - dateB : dateB - dateA;
        }
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return sort.dir === 'asc' ? -1 : 1;
        if (nameA > nameB) return sort.dir === 'asc' ? 1 : -1;
        return 0;
    });
    return items;
  }, [currentFolder, filter, sort]);
  
  const isDossierList = currentFolder.name === 'Container' || currentFolder.name === 'Residuals';
  const isClientList = currentFolder.name === 'Clients';
  const isSupplierList = currentFolder.name === 'Suppliers';
  const showStatusColumn = isDossierList || isClientList || isSupplierList;


  if (isMobile) {
    return (
      <div className="space-y-4">
        <Input 
            placeholder="Filter items..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
        />
        <div className="space-y-2">
           {filteredAndSortedItems.map(item => 'subFolders' in item ? (
                <div key={item.id} className="bg-card border rounded-lg p-3 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => onFolderClick(item.id)}>
                        <FolderIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {canEdit && <FolderActions folder={item} onDeleteFolder={onDeleteFolder} />}
                      <ChevronRight className="h-5 w-5 text-muted-foreground cursor-pointer" onClick={() => onFolderClick(item.id)} />
                    </div>
                </div>
           ) : (
                <div key={item.id} className="bg-card border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {getFileIcon(item)}
                            <div>
                                <p className="font-medium break-all">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.size} &middot; {item.lastModified}</p>
                            </div>
                        </div>
                        {canEdit && <FileActions file={item} rootFolder={rootFolder} path={path} onAddLabel={onAddLabel} onMoveFile={onMoveFile} onDeleteFile={onDeleteFile} />}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {item.labels.map(label => (
                            <span key={label.id} className={`text-xs px-2 py-0.5 rounded-full ${labelColors[label.color]}`}>{label.name}</span>
                        ))}
                    </div>
                </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Filter results..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-xs"
      />
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b">
              <SortableHeader sortKey="name" currentSort={sort} onSort={handleSort}>Name</SortableHeader>
              {showStatusColumn && <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>}
              <SortableHeader sortKey="lastModified" currentSort={sort} onSort={handleSort}>Last Modified</SortableHeader>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Expires</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Size</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Labels</th>
              <th className="w-[50px]"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredAndSortedItems.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-12 text-muted-foreground">This folder is empty.</td></tr>
            ) : (
                filteredAndSortedItems.map(item => 'subFolders' in item ? (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium cursor-pointer" onClick={() => onFolderClick(item.id)}>
                          <div className="flex items-center gap-3"><FolderIcon className="h-5 w-5" /><span>{item.name}</span></div>
                        </td>
                        {showStatusColumn && <td className="p-4">
                            {isDossierList && currentFolder.name === 'Container' && <DossierStatusIcons dossier={item} type="Container" />}
                            {isDossierList && currentFolder.name === 'Residuals' && <DossierStatusIcons dossier={item} type="Residuals" />}
                            {isClientList && <DossierStatusIcons dossier={item} type="Client" />}
                            {isSupplierList && <DossierStatusIcons dossier={item} type="Supplier" />}
                        </td>}
                        <td colSpan={4} onClick={() => onFolderClick(item.id)} className="cursor-pointer"></td>
                        <td className="p-4">
                          {canEdit && <FolderActions folder={item} onDeleteFolder={onDeleteFolder} />}
                        </td>
                    </tr>
                ) : (
                    <tr key={item.id} className="border-b">
                        <td className="p-4 font-medium"><div className="flex items-center gap-3">{getFileIcon(item)}<span className="truncate">{item.name}</span></div></td>
                        {showStatusColumn && <td></td>}
                        <td className="p-4 text-muted-foreground">{item.lastModified}</td>
                        <td className="p-4">
                            {item.expirationDate ? (
                                <div className={`flex items-center gap-1.5 ${getExpirationStatusColor(item.expirationDate)}`}>
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{format(parse(item.expirationDate, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy')}</span>
                                </div>
                            ) : <span className="text-muted-foreground">-</span>}
                        </td>
                        <td className="p-4 text-muted-foreground">{item.size}</td>
                        <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                                {item.labels.map(label => (
                                    <span key={label.id} className={`text-xs px-2 py-0.5 rounded-full ${labelColors[label.color]}`}>{label.name}</span>
                                ))}
                            </div>
                        </td>
                        <td className="p-4">{canEdit && <FileActions file={item} rootFolder={rootFolder} path={path} onAddLabel={onAddLabel} onMoveFile={onMoveFile} onDeleteFile={onDeleteFile} />}</td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
