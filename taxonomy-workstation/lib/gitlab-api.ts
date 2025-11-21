export interface GitLabConfig {
    url: string;
    projectId: string;
    token: string;
}

export function getGitLabConfig(): GitLabConfig | null {
    if (typeof window === 'undefined') return null;

    const url = localStorage.getItem('gitlab_url') || 'https://gitlab.com';
    const projectId = localStorage.getItem('gitlab_project_id');
    const token = localStorage.getItem('gitlab_pat');

    if (!projectId || !token) return null;

    return { url, projectId, token };
}

export async function fetchFileRaw(path: string): Promise<string> {
    const config = getGitLabConfig();
    if (!config) throw new Error('GitLab configuration missing');

    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`${config.url}/api/v4/projects/${config.projectId}/repository/files/${encodedPath}/raw?ref=main`, {
        headers: {
            'PRIVATE-TOKEN': config.token
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
            'PRIVATE-TOKEN': config.token
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
