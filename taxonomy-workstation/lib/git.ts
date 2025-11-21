import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';

// Use the same path as the taxonomy loader
const DATA_DIR = process.env.TAXONOMY_DATA_PATH || '/tmp/taxonomy-data/export/1.25';

// We need to point to the root of the repo, not the export dir, to run git commands
// Assuming structure: taxonomy-data/export/1.25 -> repo root is ../../
const REPO_ROOT = path.resolve(DATA_DIR, '../../');

let git: SimpleGit | null = null;

export function getGit(): SimpleGit {
    if (!git) {
        console.log('Initializing Git at:', REPO_ROOT);
        git = simpleGit(REPO_ROOT);
    }
    return git;
}

export async function commitChange(message: string, files: string[] = ['.']) {
    const git = getGit();
    try {
        await git.add(files);
        await git.commit(message);
        console.log(`Committed: "${message}"`);
    } catch (error) {
        console.error('Git commit failed:', error);
        throw error;
    }
}

export async function getHistory(file?: string) {
    const git = getGit();
    try {
        const log = await git.log(file ? { file } : undefined);
        return log.all;
    } catch (error) {
        console.error('Git log failed:', error);
        return [];
    }
}

export async function createVersion(versionName: string) {
    const git = getGit();
    try {
        await git.checkoutLocalBranch(versionName);
        console.log(`Created version (branch): ${versionName}`);
    } catch (error) {
        console.error('Failed to create version:', error);
        throw error;
    }
}
