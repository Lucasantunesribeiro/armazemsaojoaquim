/**
 * DIAGNÓSTICO DE COMPONENTES - SOLUÇÃO PARA ERROS FACTORY/CALL
 */

// Tipo para verificação de componentes
type ComponentChecker = {
  name: string
  component: any
  isValid: boolean
  error?: string
}

/**
 * Verifica se um componente está corretamente exportado e funcional
 */
export function validateComponent(name: string, component: any): ComponentChecker {
  try {
    if (!component) {
      return {
        name,
        component,
        isValid: false,
        error: `Componente ${name} não foi encontrado ou é undefined`
      }
    }

    if (typeof component !== 'function' && typeof component !== 'object') {
      return {
        name,
        component,
        isValid: false,
        error: `Componente ${name} não é uma função React válida`
      }
    }

    if (!component.displayName && !component.name) {
      console.warn(`⚠️ Componente ${name} não possui displayName definido`)
    }

    return {
      name,
      component,
      isValid: true
    }

  } catch (error) {
    return {
      name,
      component,
      isValid: false,
      error: `Erro ao validar ${name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

/**
 * Executa diagnóstico completo dos componentes UI críticos
 */
export async function runComponentDiagnostics() {
  console.log('🔍 Iniciando diagnóstico de componentes UI...')
  
  const diagnostics: ComponentChecker[] = []
  
  try {
    const { Button } = await import('@/components/ui/Button')
    const { Input } = await import('@/components/ui/Input') 
    const { Card } = await import('@/components/ui/Card')
    const SafeImage = (await import('@/components/ui/SafeImage')).default
    const { Loading } = await import('@/components/ui/Loading')

    diagnostics.push(validateComponent('Button', Button))
    diagnostics.push(validateComponent('Input', Input))
    diagnostics.push(validateComponent('Card', Card))
    diagnostics.push(validateComponent('SafeImage', SafeImage))
    diagnostics.push(validateComponent('Loading', Loading))

    const invalidComponents = diagnostics.filter(d => !d.isValid)
    const validComponents = diagnostics.filter(d => d.isValid)

    console.log(`✅ Componentes válidos: ${validComponents.length}`)
    console.log(`❌ Componentes com problemas: ${invalidComponents.length}`)

    if (invalidComponents.length > 0) {
      console.error('🚨 COMPONENTES COM PROBLEMAS:')
      invalidComponents.forEach(comp => {
        console.error(`- ${comp.name}: ${comp.error}`)
      })
    }

    return {
      success: invalidComponents.length === 0,
      validComponents,
      invalidComponents,
      summary: `${validComponents.length}/${diagnostics.length} componentes válidos`
    }

  } catch (error) {
    console.error('❌ Erro grave no diagnóstico:', error)
    return {
      success: false,
      validComponents: [],
      invalidComponents: [],
      summary: 'Falha completa no diagnóstico',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

/**
 * Hook para executar diagnóstico automaticamente
 */
export function useDiagnostics() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const hasRun = sessionStorage.getItem('component-diagnostics-run')
    if (!hasRun) {
      runComponentDiagnostics().then(() => {
        sessionStorage.setItem('component-diagnostics-run', 'true')
      })
    }
  }
}