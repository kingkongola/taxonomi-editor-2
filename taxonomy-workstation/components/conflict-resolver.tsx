'use client';

import { useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Conflict } from '@/lib/rdf-merge';

interface ConflictResolverProps {
    conflicts: Conflict[];
    onResolve: (resolutions: Map<number, 'local' | 'remote'>) => void;
    onCancel: () => void;
}

export function ConflictResolver({ conflicts, onResolve, onCancel }: ConflictResolverProps) {
    const [resolutions, setResolutions] = useState<Map<number, 'local' | 'remote'>>(new Map());

    const handleResolve = (index: number, choice: 'local' | 'remote') => {
        const newResolutions = new Map(resolutions);
        newResolutions.set(index, choice);
        setResolutions(newResolutions);
    };

    const handleSubmit = () => {
        // Check all conflicts are resolved
        if (resolutions.size !== conflicts.length) {
            alert('Please resolve all conflicts before continuing');
            return;
        }
        onResolve(resolutions);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <AlertTriangle className="text-yellow-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Merge Conflicts Detected</h2>
                            <p className="text-sm text-slate-400">
                                {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} need{conflicts.length === 1 ? 's' : ''} your attention
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conflicts List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {conflicts.map((conflict, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                            <div className="p-4 bg-slate-800/80 border-b border-slate-700">
                                <div className="text-sm font-mono text-slate-300">
                                    {conflict.subject}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Property: <code className="text-blue-400">{conflict.predicate.split('#').pop()}</code>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 divide-x divide-slate-700">
                                {/* Local Version */}
                                <button
                                    onClick={() => handleResolve(index, 'local')}
                                    className={`p-4 text-left transition-colors ${resolutions.get(index) === 'local'
                                            ? 'bg-green-500/20 border-2 border-green-500'
                                            : 'hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-300">Your Changes</span>
                                        {resolutions.get(index) === 'local' && (
                                            <Check className="text-green-400" size={20} />
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-400 font-mono bg-slate-900/50 p-2 rounded">
                                        {conflict.localValue === '(deleted)' ? (
                                            <span className="text-red-400 italic">Deleted</span>
                                        ) : (
                                            conflict.localValue
                                        )}
                                    </div>
                                </button>

                                {/* Remote Version */}
                                <button
                                    onClick={() => handleResolve(index, 'remote')}
                                    className={`p-4 text-left transition-colors ${resolutions.get(index) === 'remote'
                                            ? 'bg-green-500/20 border-2 border-green-500'
                                            : 'hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-300">Their Changes</span>
                                        {resolutions.get(index) === 'remote' && (
                                            <Check className="text-green-400" size={20} />
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-400 font-mono bg-slate-900/50 p-2 rounded">
                                        {conflict.remoteValue === '(deleted)' ? (
                                            <span className="text-red-400 italic">Deleted</span>
                                        ) : (
                                            conflict.remoteValue
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        {resolutions.size} of {conflicts.length} conflicts resolved
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors flex items-center gap-2"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={resolutions.size !== conflicts.length}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded text-white font-medium transition-colors flex items-center gap-2"
                        >
                            <Check size={16} />
                            Resolve & Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
