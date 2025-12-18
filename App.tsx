
import React, { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { MainPanel } from './components/MainPanel';
import { Dashboard } from './components/Dashboard';
import { ShipmentsView } from './components/ShipmentsView';
import { SettingsPage } from './components/SettingsPage';
import type { Folder, Label, File, SearchResultItem } from './types';
import { initialData, findFolderById, findParentFolder } from './constants';
import { useMediaQuery } from './hooks/useMediaQuery';

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  const [data, setData] = useState<Folder>(initialData);
  const [activeFolderId, setActiveFolderId] = useState<string>(initialData.id);
  const [path, setPath] = useState<Folder[]>([]);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  
  const isMobile = useMediaQuery('(max-width: 768px)');


  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    if (activeFolderId === 'settings') {
      setActiveFolder(null);
      setPath([]);
      return;
    }

    const findPath = (folder: Folder, id: string, currentPath: Folder[]): Folder[] | null => {
      currentPath.push(folder);
      if (folder.id === id) {
        return currentPath;
      }
      for (const subFolder of folder.subFolders) {
        const result = findPath(subFolder, id, [...currentPath]);
        if (result) {
          return result;
        }
      }
      return null;
    };

    const currentFolder = findFolderById(data, activeFolderId);
    setActiveFolder(currentFolder);

    const currentPath = findPath(data, activeFolderId, []);
    setPath(currentPath || []);

  }, [activeFolderId, data]);

  const handleSelectFolder = useCallback((id: string) => {
    setActiveFolderId(id);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const handleAddLabel = useCallback(async (fileId: string, label: Label) => {
    await sleep(500); // Simulate network delay
    setData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        const findAndAddLabel = (folder: Folder): boolean => {
            const file = folder.files.find(f => f.id === fileId);
            if (file) {
                if (!file.labels.some(l => l.id === label.id)) {
                    file.labels.push(label);
                }
                return true;
            }
            for (const sub of folder.subFolders) {
                if (findAndAddLabel(sub)) return true;
            }
            return false;
        }
        findAndAddLabel(newData);
        return newData;
    });
  }, []);

  const handleMoveFile = useCallback(async (fileId: string, targetFolderId: string) => {
    await sleep(500); // Simulate network delay
    setData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        let fileToMove: File | null = null;
        
        const sourceFolder = findParentFolder(newData, fileId);
        if (sourceFolder) {
            const fileIndex = sourceFolder.files.findIndex(f => f.id === fileId);
            if (fileIndex > -1) {
                fileToMove = sourceFolder.files[fileIndex];
                sourceFolder.files.splice(fileIndex, 1);
            }
        }

        if (fileToMove) {
            const targetFolder = findFolderById(newData, targetFolderId);
            if (targetFolder) {
                targetFolder.files.push(fileToMove!);
            }
        }
        return newData;
    });
  }, []);

  const handleAddFile = useCallback(async (targetFolderId: string, newFile: Omit<File, 'id' | 'lastModified' | 'previewUrl'>): Promise<void> => {
    await sleep(1000); // Simulate upload delay
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const targetFolder = findFolderById(newData, targetFolderId);
      if (targetFolder) {
        const file: File = {
          ...newFile,
          id: `file${Date.now()}`,
          lastModified: new Date().toLocaleDateString(),
          previewUrl: `https://picsum.photos/seed/${Date.now()}/400/300`,
        };
        targetFolder.files.push(file);
        // If file was added to a different folder, navigate to it
        if(targetFolderId !== activeFolderId) {
            setActiveFolderId(targetFolderId);
        }
      }
      return newData;
    });
  }, [activeFolderId]);

  const handleDeleteFile = useCallback(async (fileId: string): Promise<void> => {
    await sleep(500); // Simulate network delay
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const parentFolder = findParentFolder(newData, fileId);
      if (parentFolder) {
        parentFolder.files = parentFolder.files.filter(f => f.id !== fileId);
      }
      return newData;
    });
  }, []);

  const handleAddFolder = useCallback(async (parentId: string, folderName: string, details: Partial<Folder>): Promise<void> => {
    await sleep(500); // Simulate network delay
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const parentFolder = findFolderById(newData, parentId);
      if (parentFolder) {
        let clientName;
        let supplierName;
        let productNames;

        if (details.clientId) {
          clientName = findFolderById(newData, details.clientId)?.name;
        }
        if (details.supplierId) {
          supplierName = findFolderById(newData, details.supplierId)?.name;
        }
        if (details.productIds) {
          const productsFolder = findFolderById(newData, 'f4');
          productNames = details.productIds.map(id => productsFolder?.subFolders.find(p => p.id === id)?.name).filter(Boolean) as string[];
        }

        const newFolder: Folder = {
          id: `folder${Date.now()}`,
          name: folderName,
          files: [],
          collaborators: [],
          subFolders: [],
          ...details,
          clientName,
          supplierName,
          productNames,
        };
        parentFolder.subFolders.push(newFolder);
      }
      return newData;
    });
  }, []);

  const handleUpdateFolder = useCallback(async (folderId: string, updates: Partial<Folder>): Promise<void> => {
    await sleep(500); // Simulate network delay
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const folderToUpdate = findFolderById(newData, folderId);
      if (folderToUpdate) {
        let clientName = folderToUpdate.clientName;
        let supplierName = folderToUpdate.supplierName;
        let productNames = folderToUpdate.productNames;

        if (updates.clientId && updates.clientId !== folderToUpdate.clientId) {
          clientName = findFolderById(newData, updates.clientId)?.name;
        }
        if (updates.supplierId && updates.supplierId !== folderToUpdate.supplierId) {
          supplierName = findFolderById(newData, updates.supplierId)?.name;
        }
        if (updates.productIds && JSON.stringify(updates.productIds) !== JSON.stringify(folderToUpdate.productIds)) {
          const productsFolder = findFolderById(newData, 'f4');
          productNames = updates.productIds.map(id => productsFolder?.subFolders.find(p => p.id === id)?.name).filter(Boolean) as string[];
        }
        Object.assign(folderToUpdate, updates, { clientName, supplierName, productNames });
      }
      return newData;
    });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const results: SearchResultItem[] = [];

    const find = (folder: Folder, pathString: string) => {
      const currentPath = pathString ? `${pathString} > ${folder.name}` : folder.name;

      if (folder.id !== 'root' && folder.name.toLowerCase().includes(normalizedQuery)) {
        results.push({ item: folder, path: pathString });
      }

      folder.files.forEach(file => {
        if (file.name.toLowerCase().includes(normalizedQuery)) {
          results.push({ item: file, path: currentPath });
        }
      });

      folder.subFolders.forEach(subFolder => {
        find(subFolder, currentPath);
      });
    };

    find(data, '');
    setSearchResults(results);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchResultClick = (result: SearchResultItem) => {
    if ('subFolders' in result.item) { // It's a Folder
      setActiveFolderId(result.item.id);
    } else { // It's a File
      const parent = findParentFolder(data, result.item.id);
      if (parent) {
        setActiveFolderId(parent.id);
      }
    }
    handleClearSearch();
  };
  
  const handleMenuClick = () => setMobileMenuOpen(true);

  const renderContent = () => {
    if (activeFolderId === 'settings') {
      return <SettingsPage theme={theme} setTheme={setTheme} isMobile={isMobile} onMenuClick={handleMenuClick} />;
    }

    if (activeFolderId === 'root' || searchQuery) {
      return (
        <Dashboard 
          rootFolder={data} 
          onNavigate={handleSelectFolder} 
          onAddFile={handleAddFile} 
          onAddFolder={handleAddFolder}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          searchResults={searchResults}
          onResultClick={handleSearchResultClick}
          onClearSearch={handleClearSearch}
          isMobile={isMobile}
          onMenuClick={handleMenuClick}
        />
      );
    }
    
    if (activeFolder) {
      if(activeFolder.id === 'f3') {
        return <ShipmentsView shipmentsFolder={activeFolder} onNavigate={handleSelectFolder} isMobile={isMobile} onMenuClick={handleMenuClick} />
      }

      return (
        <MainPanel
          currentFolder={activeFolder}
          rootFolder={data}
          path={path}
          onFolderClick={handleSelectFolder}
          onNavigate={handleSelectFolder}
          onAddLabel={handleAddLabel}
          onMoveFile={handleMoveFile}
          onAddFile={handleAddFile}
          onDeleteFile={handleDeleteFile}
          onAddFolder={handleAddFolder}
          onUpdateFolder={handleUpdateFolder}
          onMenuClick={handleMenuClick}
          isMobile={isMobile}
        />
      );
    }

    return null; // or a loading/error component
  };
  
  const mainContentMargin = isMobile ? 'ml-0' : (isSidebarCollapsed ? 'ml-16' : 'ml-64');

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar
        data={data}
        activeFolderId={activeFolderId}
        onSelectFolder={handleSelectFolder}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className={`flex-1 transition-all duration-300 ${mainContentMargin}`}>
        {renderContent()}
      </div>
    </div>
  );
}
