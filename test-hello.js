// Teste para API hello
async function testHelloAPI() {
  console.log('🧪 Testando API hello...')
  
  try {
    const response = await fetch('http://localhost:3000/api/hello')
    console.log('Status:', response.status)
    console.log('Content-Type:', response.headers.get('content-type'))
    
    const text = await response.text()
    console.log('Response text:', text)
    
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

testHelloAPI() 