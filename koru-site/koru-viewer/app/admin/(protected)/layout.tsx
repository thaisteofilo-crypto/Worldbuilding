import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminShell } from './_shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = process.env.ADMIN_TOKEN
  if (!token) {
    redirect('/admin/login')
  }
  const adminCookie = cookieStore.get('koru-admin')

  if (adminCookie?.value !== token) {
    redirect('/admin/login')
  }

  return <AdminShell>{children}</AdminShell>
}
