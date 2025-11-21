'use client';

import { Settings, Monitor, Keyboard, Database, LogIn, LogOut, User } from 'lucide-react';
import { isAuthenticated, getUserInfo, initiateLogin, logout } from '@/lib/gitlab-oauth';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState<{ username: string; name: string } | null>(null);
    const [projectId, setProjectId] = useState('');

    useEffect(() => {
        setAuthenticated(isAuthenticated());
        setUserInfo(getUserInfo());
        setProjectId(localStorage.getItem('gitlab_project_id') || '');
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-slate-100">Settings</h1>

            <div className="space-y-8">
                <section>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Monitor size={16} /> Appearance
                    </h3>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="p-4 flex items-center justify-between border-b border-slate-800">
                            <div>
                                <div className="font-medium text-slate-200">Theme</div>
                                <div className="text-sm text-slate-500">Select your interface theme</div>
                            </div>
                            <select className="bg-slate-950 border border-slate-700 rounded px-3 py-1 text-slate-300 text-sm">
                                <option>Dark (Default)</option>
                                <option>Light</option>
                                <option>System</option>
                            </select>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <div className="font-medium text-slate-200">Density</div>
                                <div className="text-sm text-slate-500">Adjust the compactness of the UI</div>
                            </div>
                            <select className="bg-slate-950 border border-slate-700 rounded px-3 py-1 text-slate-300 text-sm">
                                <option>Comfortable</option>
                                <option>Compact</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Database size={16} /> GitLab Authentication
                    </h3>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden p-6 space-y-4">
                        {authenticated && userInfo ? (
                            <>
                                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <User className="text-blue-400" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-200">{userInfo.name}</div>
                                        <div className="text-sm text-slate-400">@{userInfo.username}</div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-sm transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-1">Project ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 12345678"
                                        value={projectId}
                                        onChange={(e) => {
                                            setProjectId(e.target.value);
                                            localStorage.setItem('gitlab_project_id', e.target.value);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Find this in your GitLab project's Settings → General
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400 mb-6">
                                    Login with your GitLab account to save changes to the taxonomy repository.
                                </p>
                                <button
                                    onClick={initiateLogin}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                                >
                                    <LogIn size={20} />
                                    Login with GitLab
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Keyboard size={16} /> Shortcuts
                    </h3>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-sm">Command Palette</span>
                                <kbd className="bg-slate-800 px-2 py-1 rounded text-xs font-mono text-slate-400">⌘K</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-sm">Global Search</span>
                                <kbd className="bg-slate-800 px-2 py-1 rounded text-xs font-mono text-slate-400">⌘Space</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-sm">Split View</span>
                                <kbd className="bg-slate-800 px-2 py-1 rounded text-xs font-mono text-slate-400">⌘\</kbd>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
