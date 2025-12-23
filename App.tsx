
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { MainPanel } from './components/MainPanel';
import { Dashboard } from './components/Dashboard';
import { ShipmentsView } from './components/ShipmentsView';
import { SettingsPage } from './components/SettingsPage';
import { LoginView } from './components/LoginView';
import type { Folder, Label, File, SearchResultItem, Collaborator } from './types';
import { initialData, findFolderById, findParentFolder } from './constants';
import { useMediaQuery } from './hooks/useMediaQuery';

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface UserAccount extends Collaborator {
  email: string;
  password?: string;
  status: 'Approved' | 'Pending';
}

// Hardcoded credentials removed for security. 
// The first user to sign up becomes the Admin (Owner).
const INITIAL_USERS: UserAccount[] = [];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAIInitialized, setIsAIInitialized] = useState(false);
  const [data, setData] = useState<Folder>(initialData);
  const [activeFolderId, setActiveFolderId] = useState<string>(initialData.id);
  const [path, setPath] = useState<Folder[]>([]);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  
  // User Management State
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  // AI Security Check
  useEffect(() => {
    async function checkSecurity() {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsAIInitialized(hasKey);
      } else {
        setIsAIInitialized(true);
      }
    }
    checkSecurity();
  }, [isAuthenticated]);

  const handleLogin = async (email: string, password?: string) => {
    await sleep(800);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (user.status === 'Pending') {
        throw new Error("Your account is pending approval by an administrator.");
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      return;
    }
    throw new Error("Invalid credentials.");
  };

  const handleSignUp = async (name: string, email: string, password?: string) => {
    await sleep(1000);
    if (users.some(u => u.email === email)) {
      throw new Error("User already exists with this email.");
    }

    // BOOTSTRAP LOGIC: First user is automatically Approved and becomes the Owner.
    const isFirstUser = users.length === 0;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: isFirstUser ? 'Owner' : 'View',
      status: isFirstUser ? 'Approved' : 'Pending'
    };
    
    setUsers(prev => [...prev, newUser]);
    
    if (isFirstUser) {
        // Auto-login for the bootstrap admin
        setCurrentUser(newUser);
        setIsAuthenticated(true);
    }
  };

  const handleResetPassword = async (email: string, newPassword?: string) => {
    await sleep(1000);
    const userExists = users.some(u => u.email === email);
    if (!userExists) throw new Error("No account found with that email address.");
    
    setUsers(prev => prev.map(u => u.email === email ? { ...u, password: newPassword } : u));
  };

  const handleApproveUser = async (userId: string) => {
    await sleep(500);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Approved' } : u));
  };

  const handleRejectUser = async (userId: string) => {
    await sleep(500);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleInitializeAI = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setIsAIInitialized(true);
    } else {
      setIsAIInitialized(true);
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

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

  const canEdit = useMemo(() => {
    return currentUser?.role === 'Owner' || currentUser?.role === 'Edit';
  }, [currentUser]);

  const handleSelectFolder = useCallback((id: string) => {
    setActiveFolderId(id);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const handleAddLabel = useCallback(async (fileId: string, label: Label) => {
    if (!canEdit) return;
    await sleep(500); 
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
  }, [canEdit]);

  const handleMoveFile = useCallback(async (fileId: string, targetFolderId: string) => {
    if (!canEdit) return;
    await sleep(500);
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
  }, [canEdit]);

  const handleAddFile = useCallback(async (targetFolderId: string, newFile: Omit<File, 'id' | 'lastModified' | 'previewUrl'>): Promise<void> => {
    if (!canEdit) return;
    await sleep(1000);
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
        if(targetFolderId !== activeFolderId) {
            setActiveFolderId(targetFolderId);
        }
      }
      return newData;
    });
  }, [activeFolderId, canEdit]);

  const handleDeleteFile = useCallback(async (fileId: string): Promise<void> => {
    if (!canEdit) return;
    await sleep(500);
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const parentFolder = findParentFolder(newData, fileId);
      if (parentFolder) {
        parentFolder.files = parentFolder.files.filter(f => f.id !== fileId);
      }
      return newData;
    });
  }, [canEdit]);

  const handleAddFolder = useCallback(async (parentId: string, folderName: string, details: Partial<Folder>): Promise<void> => {
    if (!canEdit) return;
    await sleep(500);
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
  }, [canEdit]);

  const handleUpdateFolder = useCallback(async (folderId: string, updates: Partial<Folder>): Promise<void> => {
    if (!canEdit) return;
    await sleep(500);
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
  }, [canEdit]);

  const handleDeleteFolder = useCallback(async (folderId: string): Promise<void> => {
    if (!canEdit) return;
    await sleep(500);
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const findAndRemove = (root: Folder): boolean => {
        const index = root.subFolders.findIndex(f => f.id === folderId);
        if (index > -1) {
          root.subFolders.splice(index, 1);
          return true;
        }
        for (const sub of root.subFolders) {
          if (findAndRemove(sub)) return true;
        }
        return false;
      };
      
      const parent = path[path.length - 2];
      findAndRemove(newData);
      
      if (activeFolderId === folderId && parent) {
        setActiveFolderId(parent.id);
      } else if (activeFolderId === folderId) {
        setActiveFolderId('root');
      }
      
      return newData;
    });
  }, [canEdit, path, activeFolderId]);

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
    if ('subFolders' in result.item) {
      setActiveFolderId(result.item.id);
    } else {
      const parent = findParentFolder(data, result.item.id);
      if (parent) {
        setActiveFolderId(parent.id);
      }
    }
    handleClearSearch();
  };
  
  const handleMenuClick = () => setMobileMenuOpen(true);

  if (!isAuthenticated || !isAIInitialized) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        onSignUp={handleSignUp}
        onResetPassword={handleResetPassword}
        onInitializeAI={handleInitializeAI}
        isAuthenticated={isAuthenticated}
        isAIInitialized={isAIInitialized}
      />
    );
  }

  const renderContent = () => {
    if (activeFolderId === 'settings') {
      return (
        <SettingsPage 
          theme={theme} 
          setTheme={setTheme} 
          isMobile={isMobile} 
          onMenuClick={handleMenuClick} 
          currentUser={currentUser!} 
          setCurrentUser={(u) => {
             const user = u as UserAccount;
             setCurrentUser(user);
             setUsers(prev => prev.map(p => p.id === user.id ? user : p));
          }} 
          allUsers={users}
          onApproveUser={handleApproveUser}
          onRejectUser={handleRejectUser}
          onSignOut={handleSignOut}
        />
      );
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
          canEdit={canEdit}
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
          onDeleteFolder={handleDeleteFolder}
          onMenuClick={handleMenuClick}
          isMobile={isMobile}
          canEdit={canEdit}
        />
      );
    }

    return null;
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
        currentUser={currentUser!}
      />
      <div className={`flex-1 transition-all duration-300 ${mainContentMargin}`}>
        {renderContent()}
      </div>
    </div>
  );
}
