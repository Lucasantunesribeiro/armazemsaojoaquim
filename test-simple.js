// Teste para API simples
async function testSimpleAPI() {
  console.log('🧪 Testando API simples...')
  
  try {
    const response = await fetch('http://localhost:3000/api/test-simple')
    console.log('Status:', response.status)
    console.log('Content-Type:', response.headers.get('content-type'))
    
    const text = await response.text()
    console.log('Response text:', text.substring(0, 500))
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const data = JSON.parse(text)
        console.log('✅ JSON Response:', data)
      } catch (e) {
        console.log('❌ Erro ao parsear JSON:', e.message)
      }
    } else {
      console.log('❌ Resposta não é JSON')
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message)
  }
}

testSimpleAPI() 