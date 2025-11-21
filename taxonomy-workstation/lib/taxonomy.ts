import { Store, Parser, DataFactory } from 'n3';
import { fetchFileRaw, getGitLabConfig } from './gitlab-api';

const { namedNode } = DataFactory;

export type TaxonomyNode = {
  id: string;
  type: string;
  prefLabel: string;
  definition?: string;
  relations: { type: string; target: string; targetLabel?: string }[];
};

let store: Store | null = null;
let isInitializing = false;

// Dual-mode: support both local dev (server-side) and GitLab Pages (client-side)
const DATA_DIR = process.env.TAXONOMY_DATA_PATH || '/tmp/taxonomy-data/export/1.25';
const GITLAB_BASE_PATH = 'export/1.25'; // Path within the GitLab repo

async function loadFileContent(filename: string): Promise<string> {
  // Client-side: try GitLab API first
  if (typeof window !== 'undefined') {
    const config = getGitLabConfig();
    if (config) {
      try {
        const filePath = `${GITLAB_BASE_PATH}/${filename}`;
        return await fetchFileRaw(filePath);
      } catch (error) {
        console.error(`Failed to fetch ${filename} from GitLab:`, error);
        throw error;
      }
    }
  }

  // Server-side: use filesystem
  const fs = await import('fs');
  const path = await import('path');
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf-8');
}

export async function getTaxonomyStore(): Promise<Store> {
  if (store) return store;
  if (isInitializing) {
    // Wait for initialization
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (store) return store;
    }
  }

  isInitializing = true;
  const newStore = new Store();
  const parser = new Parser();

  console.log('Loading taxonomy...');

  try {
    // List relevant files - we focus on core concepts for the workstation
    const files = [
      'Skill.ttl',
      'OccupationName.ttl',
      'JobTitle.ttl',
      'Region.ttl',
      'Country.ttl',
      'SsykLevel4.ttl',
      'EscoSkill.ttl'
    ];

    for (const file of files) {
      try {
        console.log(`Parsing ${file}...`);
        const content = await loadFileContent(file);
        const quads = parser.parse(content);
        newStore.addQuads(quads);
      } catch (error) {
        console.warn(`Skipping ${file}:`, error);
      }
    }

    store = newStore;
    console.log(`Taxonomy loaded. Size: ${store.size} quads.`);
  } catch (error) {
    console.error('Error loading taxonomy:', error);
    throw error;
  } finally {
    isInitializing = false;
  }

  return store!;
}

export async function searchConcepts(query: string, limit = 50): Promise<TaxonomyNode[]> {
  const store = await getTaxonomyStore();
  const results: TaxonomyNode[] = [];
  const lowerQuery = query.toLowerCase();

  // Basic scan - in production this should be an indexed search
  // We look for triples with predicate skos:prefLabel
  const prefLabel = namedNode('http://www.w3.org/2004/02/skos/core#prefLabel');

  let count = 0;

  // Iterate over all prefLabels
  for (const quad of store.match(null, prefLabel, null, null)) {
    if (count >= limit) break;

    const label = quad.object.value;
    if (label.toLowerCase().includes(lowerQuery)) {
      const subject = quad.subject;

      // Get type
      const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
      // In N3 v1.16+, match returns a stream/dataset, but we can iterate it.
      // However, the error suggests .next() does not exist on the return type of match.
      // N3 store.match returns a Stream which is also an Iterable in some versions, but let's be safe.
      // Casting to 'Quad_Subject' via unknown to satisfy TS
      const typeQuads = store.getQuads(subject as unknown as import('n3').Quad_Subject, rdfType, null, null);
      const typeQuad = typeQuads.length > 0 ? typeQuads[0] : null;
      const type = typeQuad ? typeQuad.object.value.split('/').pop() || 'Concept' : 'Concept';

      // Get definition
      const definitionPred = namedNode('http://www.w3.org/2004/02/skos/core#definition');
      const defQuads = store.getQuads(subject as unknown as import('n3').Quad_Subject, definitionPred, null, null);
      const defQuad = defQuads.length > 0 ? defQuads[0] : null;
      const definition = defQuad ? defQuad.object.value : undefined;

      results.push({
        id: subject.value,
        type,
        prefLabel: label,
        definition,
        relations: [] // Populate on demand for details view
      });
      count++;
    }
  }

  return results;
}

export async function getConceptDetails(id: string): Promise<TaxonomyNode | null> {
  const store = await getTaxonomyStore();
  const subject = namedNode(id);

  // Check if exists
  const prefLabelPred = namedNode('http://www.w3.org/2004/02/skos/core#prefLabel');
  const labelQuads = store.getQuads(subject as unknown as import('n3').Quad_Subject, prefLabelPred, null, null);
  const labelQuad = labelQuads.length > 0 ? labelQuads[0] : null;

  if (!labelQuad) return null;

  const prefLabel = labelQuad.object.value;

  // Type
  const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  const typeQuads = store.getQuads(subject as unknown as import('n3').Quad_Subject, rdfType, null, null);
  const typeQuad = typeQuads.length > 0 ? typeQuads[0] : null;
  const type = typeQuad ? typeQuad.object.value.split('/').pop() || 'Concept' : 'Concept';

  // Definition
  const definitionPred = namedNode('http://www.w3.org/2004/02/skos/core#definition');
  const defQuads = store.getQuads(subject as unknown as import('n3').Quad_Subject, definitionPred, null, null);
  const defQuad = defQuads.length > 0 ? defQuads[0] : null;
  const definition = defQuad ? defQuad.object.value : undefined;

  // Relations (outgoing)
  const relations: { type: string; target: string; targetLabel?: string }[] = [];

  // Iterate all outgoing quads
  for (const quad of store.match(subject, null, null, null)) {
    const pred = quad.predicate.value;
    // Skip label, type, definition, etc.
    if (pred === prefLabelPred.value || pred === rdfType.value || pred === definitionPred.value) continue;

    const target = quad.object.value;
    // Try to find label for target
    let targetLabel = target;
    if (quad.object.termType === 'NamedNode') {
      const targetLabelQuads = store.getQuads(quad.object as unknown as import('n3').Quad_Subject, prefLabelPred, null, null);
      if (targetLabelQuads.length > 0) {
        targetLabel = targetLabelQuads[0].object.value;
      }
    }

    relations.push({
      type: pred.split('#').pop()?.split('/').pop() || pred,
      target,
      targetLabel
    });
  }

  return {
    id,
    type,
    prefLabel,
    definition,
    relations
  };
}
