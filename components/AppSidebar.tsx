
import React, { useState } from 'react';
import { LayoutDashboard, FolderIcon, ChevronRight, Settings, Users, Building, Package, Ship, ClipboardList, PanelLeft, FruitstarsIcon } from './Icons';
import type { Folder as FolderType, Collaborator } from '../types';
import { Dialog } from './UI';


interface AppSidebarProps {
  data: FolderType;
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentUser: Collaborator;
}

interface NavItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  subFolders: FolderType[];
}

function FolderTree({ item, level, activeFolderId, onSelectFolder, isCollapsed }: { item: NavItem; level: number; activeFolderId: string; onSelectFolder: (id: string) => void, isCollapsed: boolean }) {
  const [isOpen, setIsOpen] = useState(
    item.subFolders.some(f => activeFolderId.startsWith(f.id))
  );

  const isActive = item.id === activeFolderId;

  const handleSelect = () => onSelectFolder(item.id);
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={handleSelect}
        className={`flex items-center w-full text-left p-2 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'} ${isCollapsed ? 'justify-center' : ''}`}
      >
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          {item.icon}
          {!isCollapsed && <span className="flex-1">{item.name}</span>}
          {!isCollapsed && item.subFolders.length > 0 && (
            <ChevronRight
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
              onClick={handleToggle}
            />
          )}
        </div>
      </button>
      {!isCollapsed && isOpen && item.subFolders.length > 0 && (
        <ul className="pl-6 mt-1 space-y-1">
          {item.subFolders.map((subFolder) => (
            <li key={subFolder.id}>
              <button
                onClick={() => onSelectFolder(subFolder.id)}
                className={`flex items-center w-full text-left p-2 rounded-md transition-colors text-sm gap-3 ${subFolder.id === activeFolderId ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'}`}
              >
                <FolderIcon className="h-4 w-4" />
                <span>{subFolder.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}


const SidebarContent = ({ data, activeFolderId, onSelectFolder, isCollapsed, setIsCollapsed, setMobileMenuOpen, currentUser }: Omit<AppSidebarProps, 'isMobile' | 'isMobileMenuOpen'>) => {
    const navItems: NavItem[] = [
        { id: 'root', name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, subFolders: [] },
        { id: 'f1', name: 'Clients', icon: <Users className="h-5 w-5" />, subFolders: [] },
        { id: 'f2', name: 'Suppliers', icon: <Building className="h-5 w-5" />, subFolders: [] },
        { id: 'f4', name: 'Products', icon: <Package className="h-5 w-5" />, subFolders: [] },
        { id: 'f5', name: 'Procedures', icon: <ClipboardList className="h-5 w-5" />, subFolders: [] },
        {
          id: 'f3',
          name: 'Shipments',
          icon: <Ship className="h-5 w-5" />,
          subFolders: data.subFolders.find(f => f.id === 'f3')?.subFolders || []
        },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className={`flex items-center p-4 border-b h-16 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && 
                <div className="flex items-center gap-2">
                    <FruitstarsIcon className="h-7 w-7" />
                    <span className="text-lg font-semibold text-foreground">Fruitstars FS</span>
                </div>
                }
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded hover:bg-muted hidden md:block">
                  <PanelLeft className="h-5 w-5" />
                </button>
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                <ul>
                {navItems.map(item => (
                    <li key={item.id}>
                    <FolderTree
                        item={item}
                        level={0}
                        activeFolderId={activeFolderId}
                        onSelectFolder={onSelectFolder}
                        isCollapsed={isCollapsed}
                    />
                    </li>
                ))}
                </ul>
            </nav>

            <div className="p-4 border-t flex items-center gap-3">
               <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 rounded-full border bg-muted" />
               {!isCollapsed && (
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                 </div>
               )}
            </div>

            <div className="p-2 border-t">
                <button 
                    onClick={() => onSelectFolder('settings')}
                    className={`flex items-center w-full text-left p-2 rounded-md transition-colors ${activeFolderId === 'settings' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'} ${isCollapsed ? 'justify-center' : ''}`}
                >
                <Settings className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3">Settings</span>}
                </button>
            </div>
        </div>
    );
}

export function AppSidebar(props: AppSidebarProps) {
  const { isMobile, isMobileMenuOpen, setMobileMenuOpen } = props;

  if (isMobile) {
    return (
      <Dialog 
        isOpen={isMobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title=""
        description=""
        dialogClassName="p-0 m-0 fixed top-0 left-0 h-full w-64 max-w-[80vw] !rounded-none"
        showCloseButton={true}
      >
        <SidebarContent {...props} isCollapsed={false} />
      </Dialog>
    );
  }

  return (
    <aside className={`fixed top-0 left-0 h-full bg-card border-r flex flex-col transition-all duration-300 ${props.isCollapsed ? 'w-16' : 'w-64'}`}>
      <SidebarContent {...props} />
    </aside>
  );
}
