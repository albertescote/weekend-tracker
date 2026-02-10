import { createClient } from '@/lib/supabase/server'
import NotAuthorized from '@/components/NotAuthorized'
import { redirect } from 'next/navigation'

export default async function NotAuthorizedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Double check whitelist here to avoid manual navigation to this page by whitelisted users
  const { data: whitelistEntry } = await supabase
    .from('whitelist')
    .select('email')
    .eq('email', user.email)
    .single()

  if (whitelistEntry) {
    redirect('/')
  }

  return <NotAuthorized email={user.email!} />
}
