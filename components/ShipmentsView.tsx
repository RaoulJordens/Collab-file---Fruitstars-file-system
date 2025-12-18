

import React from 'react';
import type { Folder } from '../types';
import { Ship, Box, MenuIcon } from './Icons';
import { DossierStatusIcons } from './DossierStatusIcons';
import { Button } from './UI';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ShipmentsViewProps {
  shipmentsFolder: Folder;
  onNavigate: (folderId: string) => void;
  isMobile: boolean;
  onMenuClick: () => void;
}

export function ShipmentsView({ shipmentsFolder, onNavigate, isMobile, onMenuClick }: ShipmentsViewProps) {
  const containerFolder = shipmentsFolder.subFolders.find(f => f.name === 'Container');
  const residualsFolder = shipmentsFolder.subFolders.find(f => f.name === 'Residuals');
  const containerDossiers = containerFolder?.subFolders || [];
  const residualDossiers = residualsFolder?.subFolders || [];
  const isSmallScreen = useMediaQuery('(max-width: 640px)');

  return (
    <>
      {isMobile && (
        <div className="flex items-center p-4 border-b gap-4">
            {/* FIX: The Button component requires children. Added MenuIcon as a child. */}
            <Button onClick={onMenuClick} variant="secondary" className="!p-2 !h-10 !w-10">
                <MenuIcon />
            </Button>
            <h1 className="text-xl font-bold">Shipments</h1>
        </div>
      )}
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {!isMobile && <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Container Shipments
              </h3>
            </div>
            <div className="p-6 pt-0">
              {containerDossiers.length > 0 ? (
                isSmallScreen ? (
                  <div className="space-y-2">
                    {containerDossiers.map(dossier => (
                      <div key={dossier.id} className="p-3 border rounded-md cursor-pointer hover:bg-muted/50" onClick={() => onNavigate(dossier.id)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{dossier.name}</p>
                            <p className="text-sm text-muted-foreground">{dossier.clientName} / {dossier.supplierName}</p>
                          </div>
                          <DossierStatusIcons dossier={dossier} type="Container" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="h-12 px-4 text-left font-medium text-muted-foreground">Dossier</th>
                          <th className="h-12 px-4 text-left font-medium text-muted-foreground hidden sm:table-cell">Client</th>
                          <th className="h-12 px-4 text-left font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {containerDossiers.map(dossier => (
                          <tr key={dossier.id} className="cursor-pointer border-b hover:bg-muted/50" onClick={() => onNavigate(dossier.id)}>
                            <td className="p-4 font-medium">{dossier.name}</td>
                            <td className="p-4 hidden sm:table-cell">{dossier.clientName}</td>
                            <td className="p-4"><DossierStatusIcons dossier={dossier} type="Container" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <p className="text-center text-muted-foreground py-8">No container shipments.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Residuals Shipments
              </h3>
            </div>
            <div className="p-6 pt-0">
              {residualDossiers.length > 0 ? (
                isSmallScreen ? (
                   <div className="space-y-2">
                    {residualDossiers.map(dossier => (
                      <div key={dossier.id} className="p-3 border rounded-md cursor-pointer hover:bg-muted/50" onClick={() => onNavigate(dossier.id)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{dossier.name}</p>
                            <p className="text-sm text-muted-foreground">{dossier.clientName} / {dossier.supplierName}</p>
                          </div>
                          <DossierStatusIcons dossier={dossier} type="Residuals" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="h-12 px-4 text-left font-medium text-muted-foreground">Dossier</th>
                          <th className="h-12 px-4 text-left font-medium text-muted-foreground hidden sm:table-cell">Client</th>
                          <th className="h-12 px-4 text-left font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {residualDossiers.map(dossier => (
                          <tr key={dossier.id} className="cursor-pointer border-b hover:bg-muted/50" onClick={() => onNavigate(dossier.id)}>
                            <td className="p-4 font-medium">{dossier.name}</td>
                            <td className="p-4 hidden sm:table-cell">{dossier.clientName}</td>
                            <td className="p-4"><DossierStatusIcons dossier={dossier} type="Residuals" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <p className="text-center text-muted-foreground py-8">No residual shipments.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}