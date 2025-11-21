'use client';

import React, { useState, useEffect } from 'react';
import { TaxonomyNode } from '@/lib/taxonomy';
import { Network, ChevronRight, Share2, Tag, Type } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Link from 'next/link';
import { InlineEdit } from './inline-edit';
import { GraphView } from './graph-view';
import { commitFile, getGitLabConfig } from '@/lib/gitlab-api';
import { Parser, Writer, DataFactory, Store } from 'n3';

const { namedNode, literal } = DataFactory;

export function ConceptView({ initialConcept }: { initialConcept: TaxonomyNode }) {
  const [concept, setConcept] = useState<TaxonomyNode>(initialConcept);

  // Sync if prop changes (e.g. navigation)
  useEffect(() => {
    setConcept(initialConcept);
  }, [initialConcept]);

  const handleUpdate = async (field: keyof TaxonomyNode, value: string) => {
    // Optimistic update
    setConcept(prev => ({ ...prev, [field]: value }));

    try {
      // For GitLab Pages deployment, we need to:
      // 1. Find which file contains this concept
      // 2. Update the RDF in memory
      // 3. Commit via GitLab API

      const config = getGitLabConfig();
      if (!config) {
        alert('Please configure GitLab credentials in Settings first!');
        return;
      }

      // TODO: Implement proper file lookup and RDF update
      // For now, we'll just show a success message
      console.log(`Would commit: ${field} = ${value} for ${concept.id}`);
      alert('Saving to GitLab is not fully implemented yet. Configure it in Settings!');

    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save change!");
    }
  };

  return (
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
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Network size={14} /> Relations
              </h3>

              {concept.relations.length === 0 ? (
                <p className="text-slate-600 italic text-sm">No relations defined.</p>
              ) : (
                <div className="space-y-2">
                  {concept.relations.map((rel, i) => (
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
  );
}
