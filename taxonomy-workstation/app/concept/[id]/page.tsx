import { getConceptDetails } from '@/lib/taxonomy';
import { ConceptView } from '@/components/concept-view';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConceptPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const concept = await getConceptDetails(id);

  if (!concept) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Concept not found
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ConceptView concept={concept} />
    </div>
  );
}
