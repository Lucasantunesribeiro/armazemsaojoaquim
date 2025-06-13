import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Simulando dados do cardápio - em produção, você buscaria do Supabase
const menuData = {
  appetizers: [
    { name: 'Bruschetta Italiana', price: 'R$ 18,00', description: 'Pão tostado com tomate, manjericão e mozzarella' },
    { name: 'Carpaccio de Salmão', price: 'R$ 25,00', description: 'Fatias finas de salmão com alcaparras e limão siciliano' },
    { name: 'Tábua de Frios', price: 'R$ 35,00', description: 'Seleção de queijos, presuntos e geleias artesanais' }
  ],
  mains: [
    { name: 'Risotto de Camarão', price: 'R$ 45,00', description: 'Risotto cremoso com camarões frescos e açafrão' },
    { name: 'Picanha Grelhada', price: 'R$ 55,00', description: 'Picanha no ponto com acompanhamentos tradicionais' },
    { name: 'Salmão Grelhado', price: 'R$ 48,00', description: 'Salmão grelhado com molho de maracujá' }
  ],
  desserts: [
    { name: 'Tiramisù', price: 'R$ 15,00', description: 'Sobremesa italiana tradicional' },
    { name: 'Petit Gateau', price: 'R$ 18,00', description: 'Bolinho de chocolate com sorvete de baunilha' },
    { name: 'Cheesecake de Frutas Vermelhas', price: 'R$ 16,00', description: 'Cheesecake cremoso com calda de frutas vermelhas' }
  ],
  beverages: [
    { name: 'Vinho Tinto Casa', price: 'R$ 35,00', description: 'Taça do vinho da casa' },
    { name: 'Caipirinha Premium', price: 'R$ 18,00', description: 'Caipirinha com cachaça artesanal' },
    { name: 'Suco Natural', price: 'R$ 12,00', description: 'Sucos frescos da estação' }
  ]
}

export async function GET(request: NextRequest) {
  try {
    // Caminho para o arquivo PDF
    const pdfPath = join(process.cwd(), 'public', 'images', 'Cardapio.pdf')
    
    // Ler o arquivo PDF
    const pdfBuffer = await readFile(pdfPath)
    
    // Retornar o PDF com headers corretos
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cardapio-armazem-sao-joaquim.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      }
    })

  } catch (error) {
    console.error('Erro ao servir PDF:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao baixar cardápio',
        message: 'Arquivo PDF não encontrado ou erro interno do servidor'
      },
      { status: 500 }
    )
  }
}

function generateMenuHTML(): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cardápio - Armazém São Joaquim</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #8B4513;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 2.5em;
          font-weight: bold;
          color: #8B4513;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-style: italic;
        }
        .section {
          margin-bottom: 40px;
        }
        .section-title {
          font-size: 1.8em;
          color: #8B4513;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .menu-item {
          margin-bottom: 20px;
          padding: 10px 0;
          border-bottom: 1px dotted #ccc;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }
        .item-name {
          font-weight: bold;
          font-size: 1.1em;
          color: #333;
        }
        .item-price {
          font-weight: bold;
          color: #8B4513;
        }
        .item-description {
          color: #666;
          font-size: 0.9em;
          font-style: italic;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 0.9em;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Armazém São Joaquim</div>
        <div class="subtitle">Sabores autênticos em cada prato</div>
      </div>

      <div class="section">
        <h2 class="section-title">Entradas</h2>
        ${menuData.appetizers.map(item => `
          <div class="menu-item">
            <div class="item-header">
              <span class="item-name">${item.name}</span>
              <span class="item-price">${item.price}</span>
            </div>
            <div class="item-description">${item.description}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">Pratos Principais</h2>
        ${menuData.mains.map(item => `
          <div class="menu-item">
            <div class="item-header">
              <span class="item-name">${item.name}</span>
              <span class="item-price">${item.price}</span>
            </div>
            <div class="item-description">${item.description}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">Sobremesas</h2>
        ${menuData.desserts.map(item => `
          <div class="menu-item">
            <div class="item-header">
              <span class="item-name">${item.name}</span>
              <span class="item-price">${item.price}</span>
            </div>
            <div class="item-description">${item.description}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">Bebidas</h2>
        ${menuData.beverages.map(item => `
          <div class="menu-item">
            <div class="item-header">
              <span class="item-name">${item.name}</span>
              <span class="item-price">${item.price}</span>
            </div>
            <div class="item-description">${item.description}</div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>Cardápio sujeito a alterações sem aviso prévio</p>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </body>
    </html>
  `
} 