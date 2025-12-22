
import React, { useState } from 'react';
import { Button, Input, FormField, Select } from './UI';
import { MenuIcon, Users, Check, Trash2 } from './Icons';
import type { Collaborator } from '../types';

interface UserAccount extends Collaborator {
    email: string;
    status: 'Approved' | 'Pending';
}

interface SettingsPageProps {
    theme: string;
    setTheme: (theme: string) => void;
    isMobile: boolean;
    onMenuClick: () => void;
    currentUser: Collaborator;
    setCurrentUser: (user: Collaborator) => void;
    allUsers?: UserAccount[];
    onApproveUser?: (userId: string) => Promise<void>;
    onRejectUser?: (userId: string) => Promise<void>;
    onSignOut: () => void;
}

export function SettingsPage({ theme, setTheme, isMobile, onMenuClick, currentUser, setCurrentUser, allUsers, onApproveUser, onRejectUser, onSignOut }: SettingsPageProps) {
    const isAdmin = currentUser.role === 'Owner';
    const pendingUsers = allUsers?.filter(u => u.status === 'Pending') || [];

    const handleThemeToggle = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleRoleChange = (role: Collaborator['role']) => {
        setCurrentUser({ ...currentUser, role });
    };

    return (
        <>
            {isMobile && (
              <div className="flex items-center p-4 border-b gap-4">
                  <Button onClick={onMenuClick} variant="secondary" className="!p-2 !h-10 !w-10">
                      <MenuIcon />
                  </Button>
                  <h1 className="text-xl font-bold">Settings</h1>
              </div>
            )}
            <div className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
                {!isMobile && <h1 className="text-3xl font-bold tracking-tight">Settings</h1>}

                <div className="space-y-6">
                    {/* Admin Approval Section */}
                    {isAdmin && (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Administrative Access Control</h2>
                                    <p className="text-sm text-muted-foreground">Manage pending account requests from employees.</p>
                                </div>
                            </div>
                            
                            {pendingUsers.length > 0 ? (
                                <div className="divide-y divide-border border rounded-lg bg-card overflow-hidden">
                                    {pendingUsers.map(user => (
                                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatarUrl} className="h-10 w-10 rounded-full border bg-muted" alt="" />
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    onClick={() => onApproveUser?.(user.id)} 
                                                    className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    Approve
                                                </Button>
                                                <Button 
                                                    onClick={() => onRejectUser?.(user.id)} 
                                                    variant="secondary"
                                                    className="h-9 px-3 text-destructive border-destructive hover:bg-destructive/10 gap-1.5"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 border border-dashed rounded-lg">
                                    <p className="text-muted-foreground text-sm">No pending approval requests at this time.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Profile</h2>
                        <div className="space-y-4">
                            <FormField label="Display Name" htmlFor="displayName">
                                <Input
                                    id="displayName"
                                    type="text"
                                    value={currentUser.name}
                                    onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                                />
                            </FormField>
                            <FormField label="Email" htmlFor="email">
                                <input
                                    id="email"
                                    type="email"
                                    value={(currentUser as any).email || 'employee@fruitstars.com'}
                                    disabled
                                    className="mt-1 block w-full bg-muted border-border rounded-md px-3 py-2 text-base text-muted-foreground cursor-not-allowed"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Role-Based Access Control (Security)</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            System administrators can toggle roles to verify security logic.
                        </p>
                        <div className="space-y-4">
                           <FormField label="Active Access Level">
                              <Select value={currentUser.role} onChange={(e) => handleRoleChange(e.target.value as any)}>
                                 <option value="Owner">Owner (Full System Access)</option>
                                 <option value="Edit">Editor (Can Upload & Delete)</option>
                                 <option value="View">Viewer (Read Only Access)</option>
                              </Select>
                           </FormField>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Theme</h3>
                                <p className="text-sm text-muted-foreground">
                                    Select between light and dark mode.
                                </p>
                            </div>
                             <Button variant="secondary" onClick={handleThemeToggle}>
                                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                            </Button>
                        </div>
                    </div>
                    
                     <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
                         <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Sign Out</h3>
                                <p className="text-sm text-muted-foreground">
                                    You will be returned to the secure login gateway.
                                </p>
                            </div>
                             <Button variant="secondary" onClick={onSignOut} className="border-destructive text-destructive hover:bg-destructive/10">
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
