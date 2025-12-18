

import React, { useState } from 'react';
import { Button, Input, FormField } from './UI';
import { MenuIcon } from './Icons';

interface SettingsPageProps {
    theme: string;
    setTheme: (theme: string) => void;
    isMobile: boolean;
    onMenuClick: () => void;
}

export function SettingsPage({ theme, setTheme, isMobile, onMenuClick }: SettingsPageProps) {
    const [displayName, setDisplayName] = useState("Alex Doe");

    const handleThemeToggle = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            {isMobile && (
              <div className="flex items-center p-4 border-b gap-4">
                  {/* FIX: The Button component requires children. Added MenuIcon as a child. */}
                  <Button onClick={onMenuClick} variant="secondary" className="!p-2 !h-10 !w-10">
                      <MenuIcon />
                  </Button>
                  <h1 className="text-xl font-bold">Settings</h1>
              </div>
            )}
            <div className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
                {!isMobile && <h1 className="text-3xl font-bold tracking-tight">Settings</h1>}

                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Profile</h2>
                        <div className="space-y-4">
                            {/* FIX: The FormField component requires children. Added the Input component as a child. */}
                            <FormField label="Display Name" htmlFor="displayName">
                                <Input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </FormField>
                            {/* FIX: The FormField component requires children. Added the input element as a child. */}
                            <FormField label="Email" htmlFor="email">
                                <input
                                    id="email"
                                    type="email"
                                    value="alex.doe@example.com"
                                    disabled
                                    className="mt-1 block w-full bg-muted border-border rounded-md px-3 py-2 text-base text-muted-foreground cursor-not-allowed"
                                />
                            </FormField>
                        </div>
                        <div className="mt-6 flex justify-end">
                             {/* FIX: The Button component requires children. Added text content. */}
                             <Button onClick={() => alert("Profile saved!")}>Save Changes</Button>
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
                             {/* FIX: The Button component requires children. Added text content. */}
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
                                    You will be returned to the login screen.
                                </p>
                            </div>
                             {/* FIX: The Button component requires children. Added text content. */}
                             <Button variant="secondary" className="border-destructive text-destructive hover:bg-destructive/10">
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}