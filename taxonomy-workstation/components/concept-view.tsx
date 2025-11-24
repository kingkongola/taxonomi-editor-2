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
import { DecoCorner } from './ui/deco-frame';

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
      <PanelGroup direction="horizontal" className="h-full bg-[var(--deco-bg)]">
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full overflow-y-auto p-8 deco-sunburst relative">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[var(--deco-gold-dim)] mb-8 font-cinzel tracking-widest uppercase">
              <span>Taxonomy</span>
              <ChevronRight size={10} />
              <span>{concept.type}</span>
              <ChevronRight size={10} />
              <span className="text-[var(--deco-gold)]">{concept.prefLabel}</span>
            </div>

            {/* Header */}
            <div className="mb-12 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--deco-gold)] to-transparent opacity-50"></div>

              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase border border-[var(--deco-gold)] text-[var(--deco-gold)] bg-black/50">
                  {concept.type}
                </span>
                <span className="text-xs text-[var(--deco-gold-dim)] font-mono opacity-70">{concept.id}</span>
              </div>

              <h1 className="text-5xl font-bold text-[var(--deco-text)] mb-6 font-cinzel deco-gradient-text">
                <InlineEdit
                  value={concept.prefLabel}
                  onSave={(val) => handleUpdate('prefLabel', val)}
                />
              </h1>

              <div className="text-lg text-[var(--deco-text)]/80 leading-relaxed pl-4 border-l border-[var(--deco-gold-dim)]/30 italic">
                <InlineEdit
                  value={concept.definition || ''}
                  onSave={(val) => handleUpdate('definition', val)}
                  as="textarea"
                  placeholder="Add a definition..."
                />
              </div>
            </div>

            {/* Properties */}
            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-[var(--deco-gold)]/50 to-transparent"></div>
                  <h3 className="text-sm font-bold text-[var(--deco-gold)] uppercase tracking-[0.3em] font-cinzel flex items-center gap-2">
                    <Type size={14} /> Properties
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-[var(--deco-gold)]/50 to-transparent"></div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 text-sm p-6 border border-[var(--deco-gold)]/20 bg-black/40 backdrop-blur-sm relative">
                  <DecoCorner position="top-left" className="scale-75" />
                  <DecoCorner position="bottom-right" className="scale-75" />

                  <div className="text-[var(--deco-gold-dim)] font-cinzel tracking-wider self-center">prefLabel</div>
                  <div className="text-[var(--deco-text)] font-medium">
                    <InlineEdit
                      value={concept.prefLabel}
                      onSave={(val) => handleUpdate('prefLabel', val)}
                    />
                  </div>
                  <div className="h-px col-span-2 bg-[var(--deco-gold)]/10 my-2"></div>
                  <div className="text-[var(--deco-gold-dim)] font-cinzel tracking-wider self-center">type</div>
                  <div className="text-[var(--deco-text)]">{concept.type}</div>
                </div>
              </section>

              {/* Relations */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-px w-12 bg-[var(--deco-gold)]/50"></div>
                    <h3 className="text-sm font-bold text-[var(--deco-gold)] uppercase tracking-[0.3em] font-cinzel flex items-center gap-2">
                      <Network size={14} /> Relations
                    </h3>
                  </div>

                  <button
                    onClick={() => setShowAddRelation(true)}
                    className="group relative px-4 py-2 bg-transparent overflow-hidden"
                  >
                    <div className="absolute inset-0 border border-[var(--deco-gold)] transition-all group-hover:bg-[var(--deco-gold)]/10"></div>
                    <div className="absolute inset-0 border border-[var(--deco-gold)] scale-[0.98] opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"></div>
                    <span className="relative flex items-center gap-2 text-[var(--deco-gold)] text-xs font-bold tracking-widest uppercase font-cinzel">
                      <Plus size={14} /> Add Relation
                    </span>
                  </button>
                </div>

                {concept.relations.length === 0 ? (
                  <p className="text-[var(--deco-gold-dim)] italic text-sm text-center py-8 border border-dashed border-[var(--deco-gold)]/20">No relations defined.</p>
                ) : (
                  <div className="space-y-3">
                    {concept.relations.filter(rel => rel && rel.type).map((rel, i) => (
                      <div key={i} className="flex items-center p-4 bg-gradient-to-r from-[var(--deco-gold)]/5 to-transparent border-l-2 border-[var(--deco-gold)] hover:bg-[var(--deco-gold)]/10 transition-all group relative overflow-hidden">
                        <div className="w-40 text-xs text-[var(--deco-gold-dim)] font-cinzel tracking-wider uppercase">{rel.type}</div>
                        <Link
                          href={`/concept/${encodeURIComponent(rel.target)}`}
                          className="flex-1 text-sm text-[var(--deco-text)] group-hover:text-[var(--deco-gold)] flex items-center gap-2 font-josefin"
                        >
                          {rel.targetLabel || rel.target}
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-all ml-auto text-[var(--deco-gold)]" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-[var(--deco-bg)] border-l border-r border-[var(--deco-gold-dim)]/30 hover:border-[var(--deco-gold)] transition-colors cursor-col-resize relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 border-y border-[var(--deco-gold)] bg-[var(--deco-bg)] z-10"></div>
        </PanelResizeHandle>

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
