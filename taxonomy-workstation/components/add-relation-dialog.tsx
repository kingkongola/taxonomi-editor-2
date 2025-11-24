'use client';

import { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';

interface SearchResult {
    id: string;
    prefLabel: string;
    type: string;
}

interface AddRelationProps {
    onAdd: (relationType: string, targetId: string, targetLabel: string) => void;
    onCancel: () => void;
}

const RELATION_TYPES = [
    { value: 'http://www.w3.org/2004/02/skos/core#related', label: 'related', description: 'Associative relation' },
    { value: 'http://www.w3.org/2004/02/skos/core#broader', label: 'broader', description: 'Parent concept' },
    { value: 'http://www.w3.org/2004/02/skos/core#narrower', label: 'narrower', description: 'Child concept' },
    { value: 'http://www.w3.org/2004/02/skos/core#exactMatch', label: 'exactMatch', description: 'Exact match (ESCO)' },
    { value: 'http://www.w3.org/2004/02/skos/core#closeMatch', label: 'closeMatch', description: 'Close match (ESCO)' },
];

export function AddRelationDialog({ onAdd, onCancel }: AddRelationProps) {
    const [relationType, setRelationType] = useState(RELATION_TYPES[0].value);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedConcept, setSelectedConcept] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            setSearchResults(results.slice(0, 10)); // Limit to 10 results
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = () => {
        if (!selectedConcept) {
            alert('Please select a target concept');
            return;
        }
        onAdd(relationType, selectedConcept.id, selectedConcept.prefLabel);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-100">Add Relation</h2>
                        <button
                            onClick={onCancel}
                            className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Relation Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">
                            Relation Type
                        </label>
                        <select
                            value={relationType}
                            onChange={(e) => setRelationType(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                            {RELATION_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label} - {type.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Target Concept Search */}
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">
                            Target Concept
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search for a concept..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Search Results */}
                        {searchQuery.length >= 2 && (
                            <div className="mt-2 bg-slate-800 border border-slate-700 rounded-lg max-h-64 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center text-slate-400">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400">No results found</div>
                                ) : (
                                    searchResults.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => {
                                                setSelectedConcept(result);
                                                setSearchQuery(result.prefLabel);
                                                setSearchResults([]);
                                            }}
                                            className={`w-full text-left p-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${selectedConcept?.id === result.id ? 'bg-blue-500/20' : ''
                                                }`}
                                        >
                                            <div className="font-medium text-slate-200">{result.prefLabel}</div>
                                            <div className="text-xs text-slate-400 mt-1">{result.type}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Selected Concept */}
                        {selectedConcept && searchResults.length === 0 && (
                            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-slate-200">{selectedConcept.prefLabel}</div>
                                        <div className="text-xs text-slate-400 mt-1">{selectedConcept.type}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedConcept(null);
                                            setSearchQuery('');
                                        }}
                                        className="text-slate-400 hover:text-slate-200"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedConcept}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded text-white font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Relation
                    </button>
                </div>
            </div>
        </div>
    );
}
