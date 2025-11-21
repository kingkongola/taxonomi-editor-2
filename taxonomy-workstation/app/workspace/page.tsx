import { Layers, Plus } from 'lucide-react';

export default function WorkspacePage() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-100">Workspaces</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm font-medium">
                    <Plus size={16} /> New Workspace
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {[
                    { name: 'ESCO v1.1', type: 'Standard', nodes: '12,400' },
                    { name: 'Arbetsförmedlingen Taxonomi', type: 'Custom', nodes: '24,500' },
                    { name: 'Skills Pilot 2025', type: 'Draft', nodes: '150' },
                ].map((ws, i) => (
                    <div key={i} className="flex items-center p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer">
                        <div className="p-3 rounded-lg bg-slate-800 text-slate-400 group-hover:text-blue-400 transition-colors mr-4">
                            <Layers size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-200">{ws.name}</h3>
                            <p className="text-sm text-slate-500">{ws.type} • {ws.nodes} nodes</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400">
                            Active
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
