'use client';

import React, { useState, useEffect } from 'react';
import { TaxonomyNode } from '@/lib/taxonomy';
import { Network, ChevronRight, Type, Plus } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Link from 'next/link';
import { InlineEdit } from './inline-edit';
import { GraphView } from './graph-view';
import { smartCommitFile, ConflictError, fetchFileRaw } from '@/lib/gitlab-api';
import { Parser, DataFactory, Store } from 'n3';
import { AddRelationDialog } from './add-relation-dialog';
import { ConflictResolver } from './conflict-resolver';
import { serializeStore } from '@/lib/rdf-merge';

const { namedNode } = DataFactory;

interface ConflictData {
  conflicts: Array<{
    type: 'modification' | 'deletion';
    subject: string;
    predicate: string;
    localValue: string;
    remoteValue: string;
  }>;
  baseContent: string;
  remoteContent: string;
  pendingRelation: { type: string; target: string; targetLabel?: string };
}

export function ConceptView({ initialConcept }: { initialConcept: TaxonomyNode }) {
  const [concept, setConcept] = useState<TaxonomyNode>(initialConcept);
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [baseContent, setBaseContent] = useState<string>('');

  const loadBaseContent = async () => {
    try {
      // For now, assume Skill.ttl - in production, implement file lookup
      const content = await fetchFileRaw('export/1.25/Skill.ttl');
      setBaseContent(content);
    } catch (error) {
      console.error('Failed to load base content:', error);
    }
  };

  // Sync if prop changes (e.g. navigation)
  useEffect(() => {
    const syncConcept = async () => {
      setConcept(initialConcept);
      // Load base content for conflict detection
      await loadBaseContent();
    };

    syncConcept();
  }, [initialConcept]);

  const handleAddRelation = async (relationType: string, targetId: string, targetLabel: string) => {
    setShowAddRelation(false);

    // Optimistic update
    const newRelation = { type: relationType.split('#').pop() || relationType, target: targetId, targetLabel };
    setConcept(prev => ({
      ...prev,
      relations: [...prev.relations, newRelation]
    }));

    try {
      // 1. Parse current base content
      const parser = new Parser();
      const store = new Store(parser.parse(baseContent));

      // 2. Add the new relation triple
      store.addQuad(
        namedNode(concept.id),
        namedNode(relationType),
        namedNode(targetId)
      );

      // 3. Serialize to Turtle
      const newContent = serializeStore(store);

      // 4. Smart commit with conflict detection
      const result = await smartCommitFile(
        'export/1.25/Skill.ttl',
        newContent,
        baseContent,
        `Add ${newRelation.type} relation to ${targetLabel}`
      );

      if (result.autoMerged) {
        alert('Relation added! (auto-merged with other changes)');
      } else {
        alert('Relation added!');
      }

      // Reload base content
      await loadBaseContent();

    } catch (error) {
      if (error instanceof ConflictError) {
        // Show conflict resolver
        setConflictData({
          conflicts: error.conflicts,
          baseContent: error.baseContent,
          remoteContent: error.remoteContent,
          pendingRelation: newRelation
        });
        setShowConflictResolver(true);
      } else {
        console.error("Failed to save:", error);
        alert("Failed to save relation!");
        // Revert optimistic update
        setConcept(prev => ({
          ...prev,
          relations: prev.relations.filter(r => r !== newRelation)
        }));
      }
    }
  };

  const handleResolveConflicts = async () => {
    // TODO: Apply resolutions and retry commit
    setShowConflictResolver(false);
    alert('Conflict resolution not fully implemented yet');
  };

  const handleUpdate = async (field: keyof TaxonomyNode, value: string) => {
    // Optimistic update
    setConcept(prev => ({ ...prev, [field]: value }));

    try {
      // TODO: Implement with smartCommitFile
      console.log(`Would commit: ${field} = ${value} for ${concept.id}`);
      alert('Inline editing save not fully implemented yet');

    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save change!");
    }
  };

  return (
    <>
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full overflow-y-auto p-8 bg-slate-950">
            {/* Breadcrumb mock */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <span>Taxonomy</span>
              <ChevronRight size={12} />
              <span>{concept.type}</span>
              <ChevronRight size={12} />
              <span className="text-slate-300">{concept.prefLabel}</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {concept.type}
                </span>
                <span className="text-xs text-slate-600 font-mono">{concept.id}</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-100 mb-4">
                <InlineEdit
                  value={concept.prefLabel}
                  onSave={(val) => handleUpdate('prefLabel', val)}
                />
              </h1>

              <div className="text-lg text-slate-400 leading-relaxed">
                <InlineEdit
                  value={concept.definition || ''}
                  onSave={(val) => handleUpdate('definition', val)}
                  as="textarea"
                  placeholder="Add a definition..."
                />
              </div>
            </div>

            {/* Properties */}
            <div className="space-y-8">
              <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Type size={14} /> Properties
                </h3>
                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <div className="text-slate-500">prefLabel</div>
                  <div className="text-slate-200 font-medium">
                    <InlineEdit
                      value={concept.prefLabel}
                      onSave={(val) => handleUpdate('prefLabel', val)}
                    />
                  </div>
                  <div className="text-slate-500">type</div>
                  <div className="text-slate-200">{concept.type}</div>
                </div>
              </section>

              {/* Relations */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Network size={14} /> Relations
                  </h3>
                  <button
                    onClick={() => setShowAddRelation(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs font-medium transition-colors"
                  >
                    <Plus size={14} />
                    Add Relation
                  </button>
                </div>

                {concept.relations.length === 0 ? (
                  <p className="text-slate-600 italic text-sm">No relations defined.</p>
                ) : (
                  <div className="space-y-2">
                    {concept.relations.filter(rel => rel && rel.type).map((rel, i) => (
                      <div key={i} className="flex items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group">
                        <div className="w-32 text-xs text-purple-400 font-mono">{rel.type}</div>
                        <Link
                          href={`/concept/${encodeURIComponent(rel.target)}`}
                          className="flex-1 text-sm text-slate-300 hover:text-blue-400 hover:underline flex items-center gap-2"
                        >
                          {rel.targetLabel || rel.target}
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-px bg-slate-800 hover:bg-blue-500 transition-colors cursor-col-resize" />
        <Panel defaultSize={50} minSize={30}>
          <GraphView centerNode={concept} />
        </Panel>
      </PanelGroup>

      {/* Dialogs */}
      {
        showAddRelation && (
          <AddRelationDialog
            onAdd={handleAddRelation}
            onCancel={() => setShowAddRelation(false)}
          />
        )
      }

      {
        showConflictResolver && conflictData && (
          <ConflictResolver
            conflicts={conflictData.conflicts}
            onResolve={handleResolveConflicts}
            onCancel={() => setShowConflictResolver(false)}
          />
        )
      }
    </>
  );
}
