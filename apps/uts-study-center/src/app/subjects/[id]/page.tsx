import { SubjectDetailPage } from "@/features/subjects/subject-detail-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SubjectDetailPage subjectId={decodeURIComponent(id)} />;
}
