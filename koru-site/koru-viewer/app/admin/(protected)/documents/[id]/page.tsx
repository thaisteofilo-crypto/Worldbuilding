import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { DocumentEditor } from '@/components/admin/document-editor'

export default async function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (!document) {
    notFound()
  }

  return <DocumentEditor document={document} />
}
