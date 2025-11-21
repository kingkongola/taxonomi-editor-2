import { GraphView } from '@/components/graph-view';
import { getConceptDetails } from '@/lib/taxonomy';

export default async function GraphPage() {
    // Default to a known concept for now, e.g., "Systemutvecklare" if we can find its ID, 
    // or just a hardcoded one if we know it exists. 
    // For now, let's try to find one or use a placeholder if not found.
    // Since we are server-side, we can't easily "search" without a query.
    // Let's pick a stable ID from the data we saw earlier: "https://data.jobtechdev.se/taxonomy/concept/fg7B_yov_smw" (Systemutvecklare)

    const defaultId = "https://data.jobtechdev.se/taxonomy/concept/fg7B_yov_smw";
    const concept = await getConceptDetails(defaultId);

    if (!concept) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                Concept not found. Please load data.
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                <h1 className="font-bold text-slate-100">Graph Explorer</h1>
                <div className="text-xs text-slate-500">
                    Showing: {concept.prefLabel}
                </div>
            </div>
            <div className="flex-1 relative">
                <GraphView centerNode={concept} />
            </div>
        </div>
    );
}
