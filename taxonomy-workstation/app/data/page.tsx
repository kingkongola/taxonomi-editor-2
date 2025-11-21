import { getTaxonomyStore } from '@/lib/taxonomy';

export default async function DataPage() {
    const store = await getTaxonomyStore();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-100">Data Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Quads</h3>
                    <p className="text-4xl font-bold text-blue-400">{store.size}</p>
                </div>

                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Source</h3>
                    <p className="text-xl font-semibold text-slate-300">Local Files</p>
                    <p className="text-xs text-slate-500 mt-1">/taxonomy-data/export/1.25</p>
                </div>

                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Status</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-300">Loaded</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
