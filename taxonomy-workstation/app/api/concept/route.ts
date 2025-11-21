import { NextResponse } from 'next/server';
import { getTaxonomyStore } from '@/lib/taxonomy';
import { commitChange } from '@/lib/git';
import fs from 'fs';
import path from 'path';
import { DataFactory, Writer, Parser } from 'n3';

const { namedNode, literal } = DataFactory;

// Helper to find which file a concept belongs to
// In a real app, we might have an index or a convention.
// For now, we'll scan the files in DATA_DIR or just append to a "Changes.ttl" if we want to be safe,
// but the requirement is to edit inline.
// Let's assume we know the file or we search for it.
// Since searching 200 files every save is slow, we'll implement a simple heuristic:
// If we loaded it, we might know where it came from.
// For this prototype, we will try to find the file that contains the concept definition.

const DATA_DIR = process.env.TAXONOMY_DATA_PATH || '/tmp/taxonomy-data/export/1.25';

async function findFileForConcept(conceptId: string): Promise<string | null> {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ttl'));

    // Extract the local part of the ID (e.g. fg7B_yov_smw) to search for, 
    // as the full URI might be shortened with prefixes in the file.
    const localId = conceptId.split('/').pop();

    for (const file of files) {
        const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
        // Check for full ID OR local ID to be safer against prefixes
        if (content.includes(conceptId) || (localId && content.includes(localId))) {
            console.log(`Found concept ${conceptId} in ${file}`);
            return file;
        }
    }
    console.log(`Concept ${conceptId} not found in any .ttl file in ${DATA_DIR}`);
    return null;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, field, value } = body;

        if (!id || !field || !value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`Saving ${field} = ${value} for ${id}`);

        // 1. Find the file
        let filename = await findFileForConcept(id);
        if (!filename) {
            // Fallback: if not found, maybe it's new? or we just default to a catch-all
            // For now, let's fail if not found to avoid creating mess
            return NextResponse.json({ error: 'Concept file not found' }, { status: 404 });
        }

        const filePath = path.join(DATA_DIR, filename);

        // 2. Read and Parse
        const content = fs.readFileSync(filePath, 'utf-8');
        const parser = new Parser();
        const store = new (await import('n3')).Store();
        store.addQuads(parser.parse(content));

        // 3. Update the Quad
        const subject = namedNode(id);
        let predicate = null;

        if (field === 'prefLabel') {
            predicate = namedNode('http://www.w3.org/2004/02/skos/core#prefLabel');
        } else if (field === 'definition') {
            predicate = namedNode('http://www.w3.org/2004/02/skos/core#definition');
        } else {
            return NextResponse.json({ error: 'Unsupported field' }, { status: 400 });
        }

        // Remove old value
        // We match subject and predicate, remove all (assuming single value for now)
        const matches = store.getQuads(subject as any, predicate, null, null);
        store.removeQuads(matches);

        // Add new value
        // Assuming "en" or "sv" lang tag? The data seems to have tags or not.
        // Let's check the old value to see if it had a language tag
        let language = undefined;
        if (matches.length > 0 && matches[0].object.termType === 'Literal') {
            language = (matches[0].object as any).language;
        }

        store.addQuad(subject, predicate, literal(value, language));

        // 4. Write back to file
        const writer = new Writer({ format: 'Turtle' });
        writer.addQuads(store.getQuads(null, null, null, null));

        await new Promise<void>((resolve, reject) => {
            writer.end((error, result) => {
                if (error) reject(error);
                fs.writeFileSync(filePath, result);
                resolve();
            });
        });

        // 5. Commit to Git
        await commitChange(`Update ${field} for ${id}`, [filePath]);

        return NextResponse.json({ success: true, file: filename });

    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
