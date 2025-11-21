import { getAccessToken } from './gitlab-oauth';
import { mergeRDF, MergeResult, Conflict } from './rdf-merge';

export interface GitLabConfig {
    url: string;
    projectId: string;
    token: string;
}

export class ConflictError extends Error {
    constructor(
        message: string,
        public conflicts: Conflict[],
        public baseContent: string,
        public remoteContent: string
    ) {
        super(message);
        this.name = 'ConflictError';
    }
}

export function getGitLabConfig(): GitLabConfig | null {
    if (typeof window === 'undefined') return null;

    const url = 'https://gitlab.com'; // Always use gitlab.com for OAuth
    const projectId = localStorage.getItem('gitlab_project_id');
    const token = getAccessToken(); // Use OAuth token instead of PAT

    if (!projectId || !token) return null;

    return { url, projectId, token };
}

export async function fetchFileRaw(path: string): Promise<string> {
    const config = getGitLabConfig();
    if (!config) throw new Error('GitLab configuration missing');

    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`${config.url}/api/v4/projects/${config.projectId}/repository/files/${encodedPath}/raw?ref=main`, {
        headers: {
            'Authorization': `Bearer ${config.token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    return response.text();
}

export async function commitFile(filePath: string, content: string, message: string) {
    const config = getGitLabConfig();
    if (!config) throw new Error('GitLab configuration missing');

    const encodedPath = encodeURIComponent(filePath);

    const response = await fetch(`${config.url}/api/v4/projects/${config.projectId}/repository/commits`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.token}`
        },
        body: JSON.stringify({
            branch: 'main',
            commit_message: message,
            actions: [
                {
                    action: 'update',
                    file_path: filePath,
                    content: content
                }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Commit failed: ${JSON.stringify(error)}`);
    }

    return response.json();
}

/**
 * Smart commit with automatic conflict detection and merge
 * 
 * @param filePath - Path to file in GitLab repo
 * @param localContent - User's modified content
 * @param baseContent - Content when user started editing
 * @param message - Commit message
 * @throws ConflictError if conflicts need manual resolution
 */
export async function smartCommitFile(
    filePath: string,
    localContent: string,
    baseContent: string,
    message: string
): Promise<{ success: boolean; autoMerged: boolean }> {
    // 1. Fetch current remote version
    const remoteContent = await fetchFileRaw(filePath);

    // 2. Check if remote has changed
    if (remoteContent === baseContent) {
        // No changes on remote, safe to commit directly
        await commitFile(filePath, localContent, message);
        return { success: true, autoMerged: false };
    }

    // 3. Remote has changed, attempt three-way merge
    const mergeResult = await mergeRDF(baseContent, localContent, remoteContent);

    if (mergeResult.autoMerged) {
        // Auto-merge successful!
        const { serializeStore } = await import('./rdf-merge');
        const mergedContent = serializeStore(mergeResult.merged);
        await commitFile(filePath, mergedContent, `${message} (auto-merged)`);
        return { success: true, autoMerged: true };
    } else {
        // Conflicts detected, throw error with conflict info
        throw new ConflictError(
            'Merge conflicts detected',
            mergeResult.conflicts,
            baseContent,
            remoteContent
        );
    }
}
