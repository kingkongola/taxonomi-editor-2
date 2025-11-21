import { Settings, Monitor, Keyboard, Database } from 'lucide-react';

export default function SettingsPage() {
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
                        <Database size={16} /> GitLab Configuration
                    </h3>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">GitLab URL</label>
                            <input
                                type="text"
                                placeholder="https://gitlab.com"
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                                onChange={(e) => localStorage.setItem('gitlab_url', e.target.value)}
                                defaultValue="https://gitlab.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">Project ID</label>
                            <input
                                type="text"
                                placeholder="e.g. 12345678"
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                                onChange={(e) => localStorage.setItem('gitlab_project_id', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">Personal Access Token</label>
                            <input
                                type="password"
                                placeholder="glpat-..."
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                                onChange={(e) => localStorage.setItem('gitlab_pat', e.target.value)}
                            />
                            <p className="text-xs text-slate-500 mt-1">Requires <code>api</code> or <code>write_repository</code> scope.</p>
                        </div>
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
