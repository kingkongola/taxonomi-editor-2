export default function Home() {
  return (
    <div className="flex items-center justify-center h-full flex-col text-center p-8">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        Taxonomy Workstation
      </h1>
      <p className="text-slate-400 max-w-md mb-8">
        Press <kbd className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 font-mono">⌘K</kbd> to start searching concepts, navigate the graph, or execute commands.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <h3 className="font-semibold mb-2 text-blue-400">Lightning Fast</h3>
          <p className="text-sm text-slate-500">Indexed RDF data with instant search capabilities.</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <h3 className="font-semibold mb-2 text-purple-400">Split Views</h3>
          <p className="text-sm text-slate-500">Compare concepts side-by-side with robust layout controls.</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <h3 className="font-semibold mb-2 text-green-400">Inline Editing</h3>
          <p className="text-sm text-slate-500">Edit labels and relations without leaving your keyboard.</p>
        </div>
      </div>
    </div>
  );
}
