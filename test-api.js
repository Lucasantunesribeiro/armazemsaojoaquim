// Script de teste para as APIs de reserva
const baseUrl = 'http://localhost:3000'

async function testCheckAvailability() {
  console.log('🧪 Testando API de verificação de disponibilidade...')
  
  try {
    // Teste 1: GET (deve retornar status healthy)
    console.log('\n1. Testando GET /api/check-availability')
    const getResponse = await fetch(`${baseUrl}/api/check-availability`)
    console.log('Status:', getResponse.status)
    console.log('Content-Type:', getResponse.headers.get('content-type'))
    
    if (getResponse.ok) {
      const getData = await getResponse.json()
      console.log('✅ GET Response:', getData)
    } else {
      console.log('❌ GET falhou')
    }
    
    // Teste 2: POST com dados válidos
    console.log('\n2. Testando POST com dados válidos')
    const postResponse = await fetch(`${baseUrl}/api/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: '2024-12-25',
        time: '19:00',
        guests: 4
      })
    })
    
    console.log('Status:', postResponse.status)
    if (postResponse.ok) {
      const postData = await postResponse.json()
      console.log('✅ POST Response:', postData)
    } else {
      const errorData = await postResponse.json()
      console.log('❌ POST Error:', errorData)
    }
    
    // Teste 3: POST com dados inválidos
    console.log('\n3. Testando POST com dados inválidos')
    const invalidResponse = await fetch(`${baseUrl}/api/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: 'invalid',
        time: 'invalid',
        guests: 0
      })
    })
    
    console.log('Status:', invalidResponse.status)
    const invalidData = await invalidResponse.json()
    console.log('Response:', invalidData)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

async function testReservas() {
  console.log('\n\n🧪 Testando API de reservas...')
  
  try {
    // Teste 1: GET reservas
    console.log('\n1. Testando GET /api/reservas')
    const getResponse = await fetch(`${baseUrl}/api/reservas?user_id=test-user-123`)
    console.log('Status:', getResponse.status)
    
    if (getResponse.ok) {
      const getData = await getResponse.json()
      console.log('✅ GET Reservas:', getData)
    } else {
      const errorData = await getResponse.json()
      console.log('❌ GET Error:', errorData)
    }
    
    // Teste 2: POST criar reserva
    console.log('\n2. Testando POST criar reserva')
    const postResponse = await fetch(`${baseUrl}/api/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 'test-user-123',
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(21) 99999-9999',
        data: '2024-12-25',
        horario: '19:00',
        pessoas: 4,
        observacoes: 'Mesa próxima à janela'
      })
    })
    
    console.log('Status:', postResponse.status)
    if (postResponse.ok) {
      const postData = await postResponse.json()
      console.log('✅ POST Reserva criada:', postData)
    } else {
      const errorData = await postResponse.json()
      console.log('❌ POST Error:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de reservas:', error.message)
  }
}

async function runAllTests() {
  await testCheckAvailability()
  await testReservas()
  console.log('\n🎉 Todos os testes concluídos!')
}

runAllTests() 