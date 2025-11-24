'use client';

import { useEffect, useState } from 'react';
import { handleCallback } from '@/lib/gitlab-oauth';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const errorParam = params.get('error');

            if (errorParam) {
                setError(`Authentication failed: ${errorParam}`);
                return;
            }

            if (code) {
                try {
                    await handleCallback(code);
                    router.push('/');
                } catch (err) {
                    setError((err as Error).message);
                }
            } else {
                setError('No authorization code received');
            }
        };

        processCallback();
    }, [router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="bg-slate-900 border border-red-500/50 rounded-xl p-8 max-w-md">
                    <h1 className="text-xl font-bold text-red-400 mb-4">Authentication Error</h1>
                    <p className="text-slate-300">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-300">Completing authentication...</p>
            </div>
        </div>
    );
}
