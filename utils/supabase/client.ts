import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; Path=/; ${options.maxAge ? `Max-Age=${options.maxAge};` : ''} ${options.sameSite ? `SameSite=${options.sameSite};` : ''}`
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; Path=/; Max-Age=0; ${options.sameSite ? `SameSite=${options.sameSite};` : ''}`
        }
      }
    }
  )
}