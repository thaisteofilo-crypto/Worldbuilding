import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
