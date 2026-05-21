import { notFound } from 'next/navigation'
import { getPageContent, getAllPages } from '@/lib/mdx'
import { ContentArea } from '@/components/content-area'

interface Props {
  params: Promise<{ section: string; page: string }>
}

export async function generateStaticParams() {
  const pages = await getAllPages()
  return pages.map(({ section, page }) => ({ section, page }))
}

export default async function Page({ params }: Props) {
  const { section, page } = await params
  const content = await getPageContent(section, page)

  if (!content) notFound()

  return <ContentArea content={content} />
}
