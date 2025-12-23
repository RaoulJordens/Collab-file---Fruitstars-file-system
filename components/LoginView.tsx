
import React, { useState } from 'react';
import { FruitstarsIcon } from './Icons';
import { Button, Input, FormField } from './UI';

interface LoginViewProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onSignUp: (name: string, email: string, password?: string) => Promise<void>;
  onResetPassword: (email: string, newPassword?: string) => Promise<void>;
  onInitializeAI: () => Promise<void>;
  isAuthenticated: boolean;
  isAIInitialized: boolean;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset-sent' | 'pending-approval';

export function LoginView({ onLogin, onSignUp, onResetPassword, onInitializeAI, isAuthenticated, isAIInitialized }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [isBusy, setIsBusy] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsBusy(true);
    
    try {
        if (mode === 'login') {
            await onLogin(email, password);
        } else if (mode === 'signup') {
            await onSignUp(name, email, password);
            // If they are first user, App.tsx will auto-log them in, 
            // but if they are 2nd+ user, we show pending approval.
            setMode('pending-approval');
        } else if (mode === 'forgot') {
            await onResetPassword(email, 'NewPassword123!'); // Mocking password change to a default
            setMode('reset-sent');
        }
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsBusy(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await onInitializeAI();
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0212] flex items-center justify-center p-6 z-[9999] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#35a04a]/10 rounded-full blur-[100px]" />
      
      <div className="max-w-md w-full relative">
        <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
               <FruitstarsIcon className="h-12 w-12" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {isAuthenticated ? "AI Intelligence Engine" : (
                    mode === 'login' ? "Corporate Portal" :
                    mode === 'signup' ? "Account Registration" :
                    mode === 'forgot' ? "Recover Password" :
                    mode === 'reset-sent' ? "Recovery Sent" : "Access Pending"
                )}
              </h1>
              <p className="text-sm text-muted-foreground px-4">
                {isAuthenticated 
                  ? "Verify your API billing connection to enable dossier automation." 
                  : (
                    mode === 'login' ? "Secure file management for fruit logistics professionals." :
                    mode === 'signup' ? "First user to register will be granted Admin status automatically." :
                    mode === 'forgot' ? "Enter your email to receive a simulated recovery link." :
                    mode === 'reset-sent' ? "We've simulated a reset. Your new password is 'NewPassword123!'." :
                    "Your registration is awaiting verification by the IT team."
                  )
                }
              </p>
            </div>

            {error && (
                <div className="w-full p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    {error}
                </div>
            )}

            {!isAuthenticated ? (
                mode === 'reset-sent' || mode === 'pending-approval' ? (
                    <div className="w-full space-y-4 pt-4">
                        <Button onClick={() => setMode('login')} className="w-full bg-white/10 hover:bg-white/20 h-11">
                            Back to Sign In
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleAction} className="w-full space-y-4">
                        {mode === 'signup' && (
                            <FormField label="Full Name">
                                <Input 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="Jane Doe"
                                    className="bg-white/5 border-white/10 h-11"
                                    required
                                />
                            </FormField>
                        )}
                        <FormField label="Employee Email">
                            <Input 
                                type="email"
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                placeholder="name@fruitstars.com"
                                className="bg-white/5 border-white/10 h-11"
                                required
                            />
                        </FormField>
                        {mode !== 'forgot' && (
                            <FormField label="Password">
                                <Input 
                                    type="password"
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="bg-white/5 border-white/10 h-11"
                                    required
                                />
                            </FormField>
                        )}
                        <Button 
                            type="submit" 
                            className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/80"
                            isLoading={isBusy}
                        >
                            {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create First Account' : 'Recover Account'}
                        </Button>
                        
                        <div className="flex flex-col gap-2 pt-2">
                            {mode === 'login' ? (
                                <>
                                    <button type="button" onClick={() => setMode('signup')} className="text-xs text-muted-foreground hover:text-white transition-colors">
                                        Need an account? <span className="text-primary">Sign Up</span>
                                    </button>
                                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-muted-foreground hover:text-white transition-colors">
                                        Forgot Password?
                                    </button>
                                </>
                            ) : (
                                <button type="button" onClick={() => setMode('login')} className="text-xs text-muted-foreground hover:text-white transition-colors">
                                    Already have an account? <span className="text-primary">Log In</span>
                                </button>
                            )}
                        </div>
                    </form>
                )
            ) : (
              <div className="w-full space-y-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-dashed border-white/20 flex flex-col items-center gap-4">
                   <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                   </div>
                   <div className="text-sm">
                      <p className="text-white font-medium">Stage 2: API Key Required</p>
                      <p className="text-xs text-muted-foreground mt-1">Select a paid project key to verify billing.</p>
                   </div>
                </div>
                <Button 
                  onClick={handleSync} 
                  className="w-full h-11 text-base font-semibold"
                  isLoading={isSyncing}
                >
                  Initialize AI Engine
                </Button>
                <div className="text-center">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    View Billing Documentation
                  </a>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/10 w-full flex justify-between items-center opacity-50">
               <span className="text-[10px] uppercase tracking-widest text-white/60">Secure Session v3.2</span>
               <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
               </div>
            </div>
          </div>
        </div>
        
        <p className="mt-6 text-center text-xs text-white/20 uppercase tracking-[0.2em]">
          Fruitstars Private Infrastructure &copy; 2025
        </p>
      </div>
    </div>
  );
}
