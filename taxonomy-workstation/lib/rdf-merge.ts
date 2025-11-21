import { Store, Parser, Writer, Quad } from 'n3';

/**
 * RDF Merge Strategy using Triple-based diffing
 * 
 * This is perfect for SKOS taxonomies because:
 * - Each statement (triple) is independent
 * - Adding relations doesn't conflict with other additions
 * - Only conflicts when same triple is modified differently
 */

export interface MergeResult {
    merged: Store;
    conflicts: Conflict[];
    autoMerged: boolean;
}

export interface Conflict {
    type: 'modification' | 'deletion';
    subject: string;
    predicate: string;
    localValue: string;
    remoteValue: string;
}

/**
 * Three-way merge for RDF
 * @param baseContent - Original content (common ancestor)
 * @param localContent - User's changes
 * @param remoteContent - Other user's changes
 */
export async function mergeRDF(
    baseContent: string,
    localContent: string,
    remoteContent: string
): Promise<MergeResult> {
    const parser = new Parser();

    // Parse all three versions
    const baseStore = new Store(parser.parse(baseContent));
    const localStore = new Store(parser.parse(localContent));
    const remoteStore = new Store(parser.parse(remoteContent));

    // Calculate diffs
    const localAdded = difference(localStore, baseStore);
    const localRemoved = difference(baseStore, localStore);
    const remoteAdded = difference(remoteStore, baseStore);
    const remoteRemoved = difference(baseStore, remoteStore);

    // Start with base
    const merged = new Store();
    merged.addQuads(baseStore.getQuads(null, null, null, null));

    // Apply additions from both sides (usually safe)
    for (const quad of localAdded) {
        merged.addQuad(quad);
    }
    for (const quad of remoteAdded) {
        merged.addQuad(quad);
    }

    // Detect conflicts in deletions/modifications
    const conflicts: Conflict[] = [];

    // Check if both sides removed the same triple
    const bothRemoved = intersection(localRemoved, remoteRemoved);
    for (const quad of bothRemoved) {
        merged.removeQuad(quad);
    }

    // Check if one side removed what the other modified
    const localRemovedRemoteKept = difference(localRemoved, remoteRemoved);
    const remoteRemovedLocalKept = difference(remoteRemoved, localRemoved);

    for (const quad of localRemovedRemoteKept) {
        // Local removed, remote kept/modified
        const remoteVersion = findMatchingQuad(remoteStore, quad.subject, quad.predicate);
        if (remoteVersion && !quadsEqual(quad, remoteVersion)) {
            // Conflict: local deleted, remote modified
            conflicts.push({
                type: 'modification',
                subject: quad.subject.value,
                predicate: quad.predicate.value,
                localValue: '(deleted)',
                remoteValue: remoteVersion.object.value
            });
        } else {
            // No conflict, apply local deletion
            merged.removeQuads([quad]);
        }
    }

    for (const quad of remoteRemovedLocalKept) {
        // Remote removed, local kept/modified
        const localVersion = findMatchingQuad(localStore, quad.subject, quad.predicate);
        if (localVersion && !quadsEqual(quad, localVersion)) {
            // Conflict: remote deleted, local modified
            conflicts.push({
                type: 'modification',
                subject: quad.subject.value,
                predicate: quad.predicate.value,
                localValue: localVersion.object.value,
                remoteValue: '(deleted)'
            });
        } else {
            // No conflict, apply remote deletion
            merged.removeQuads([quad]);
        }
    }

    return {
        merged,
        conflicts,
        autoMerged: conflicts.length === 0
    };
}

/**
 * Find quads in storeA that are not in storeB
 */
function difference(storeA: Store, storeB: Store): Quad[] {
    const result: Quad[] = [];
    for (const quad of storeA.getQuads(null, null, null, null)) {
        if (!storeB.has(quad)) {
            result.push(quad);
        }
    }
    return result;
}

/**
 * Find quads that exist in both stores
 */
function intersection(quadsA: Quad[], quadsB: Quad[]): Quad[] {
    return quadsA.filter(a =>
        quadsB.some(b => quadsEqual(a, b))
    );
}

/**
 * Find a quad with matching subject and predicate
 */
function findMatchingQuad(store: Store, subject: any, predicate: any): Quad | null {
    const matches = store.getQuads(subject, predicate, null, null);
    return matches.length > 0 ? matches[0] : null;
}

/**
 * Check if two quads are equal
 */
function quadsEqual(a: Quad, b: Quad): boolean {
    return a.subject.equals(b.subject) &&
        a.predicate.equals(b.predicate) &&
        a.object.equals(b.object) &&
        a.graph.equals(b.graph);
}

/**
 * Serialize a store back to Turtle format
 */
export function serializeStore(store: Store): string {
    const writer = new Writer({ format: 'Turtle' });
    return writer.quadsToString(store.getQuads(null, null, null, null));
}
