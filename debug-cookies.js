// 🔍 SCRIPT DE DIAGNÓSTICO - COOKIES E SESSÃO
// Execute este script no Console do browser (F12)

console.log('🔍 DIAGNÓSTICO DE COOKIES E SESSÃO')
console.log('='.repeat(50))

// 1. Verificar todos os cookies
console.log('\n1. TODOS OS COOKIES:')
const allCookies = document.cookie.split(';').map(c => c.trim()).filter(c => c)
console.log('Total cookies:', allCookies.length)
allCookies.forEach(cookie => {
  const [name, value] = cookie.split('=')
  console.log(`  ${name}: ${value ? value.substring(0, 50) + '...' : 'empty'}`)
})

// 2. Procurar cookies de sessão específicos
console.log('\n2. COOKIES DE SESSÃO SUPABASE:')
const sessionCookies = allCookies.filter(c => 
  c.includes('armazem-sao-joaquim-auth') || 
  c.includes('sb-') || 
  c.includes('supabase')
)
console.log('Session cookies encontrados:', sessionCookies.length)
sessionCookies.forEach(cookie => console.log(`  ${cookie}`))

// 3. Verificar localStorage
console.log('\n3. LOCALSTORAGE:')
const localStorageKeys = Object.keys(localStorage)
console.log('Total localStorage keys:', localStorageKeys.length)
localStorageKeys.forEach(key => {
  if (key.includes('auth') || key.includes('supabase') || key.includes('armazem')) {
    const value = localStorage.getItem(key)
    console.log(`  ${key}: ${value ? value.substring(0, 100) + '...' : 'empty'}`)
  }
})

// 4. Verificar sessionStorage
console.log('\n4. SESSIONSTORAGE:')
const sessionStorageKeys = Object.keys(sessionStorage)
console.log('Total sessionStorage keys:', sessionStorageKeys.length)
sessionStorageKeys.forEach(key => {
  if (key.includes('auth') || key.includes('supabase') || key.includes('armazem')) {
    const value = sessionStorage.getItem(key)
    console.log(`  ${key}: ${value ? value.substring(0, 100) + '...' : 'empty'}`)
  }
})

// 5. Verificar session específica do Supabase
console.log('\n5. VERIFICAÇÃO DE SESSÃO SUPABASE:')
const authKey = 'armazem-sao-joaquim-auth'
const authData = localStorage.getItem(authKey)
if (authData) {
  try {
    const parsed = JSON.parse(authData)
    console.log('Auth data encontrado:', {
      hasSession: !!parsed.session,
      hasAccessToken: !!parsed.session?.access_token,
      hasRefreshToken: !!parsed.session?.refresh_token,
      userEmail: parsed.session?.user?.email,
      userId: parsed.session?.user?.id,
      expiresAt: parsed.session?.expires_at,
      tokenType: parsed.session?.token_type,
      isExpired: parsed.session?.expires_at ? new Date(parsed.session.expires_at * 1000) < new Date() : 'unknown'
    })
  } catch (error) {
    console.log('Erro ao parsear auth data:', error)
  }
} else {
  console.log('❌ Auth data não encontrado no localStorage')
}

// 6. Testar se cookies são enviados para o servidor
console.log('\n6. TESTE DE COOKIES PARA SERVIDOR:')
const cookieHeader = document.cookie
console.log('Cookie header que seria enviado:', cookieHeader.length > 0 ? cookieHeader : 'EMPTY')

// 7. Informações do domínio
console.log('\n7. INFORMAÇÕES DO DOMÍNIO:')
console.log('Domain:', window.location.hostname)
console.log('Port:', window.location.port)
console.log('Protocol:', window.location.protocol)
console.log('Full URL:', window.location.href)

console.log('\n='.repeat(50))
console.log('🔍 DIAGNÓSTICO CONCLUÍDO')
console.log('Execute este script e copie os resultados para análise!')