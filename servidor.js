const express = require('express'); // Importa o framework Express para criar e gerenciar rotas e servidores HTTP
const bodyParser = require('body-parser'); // Middleware que faz o parsing do corpo das requisições, como JSON ou dados de formulário
const pdf = require('html-pdf'); // Biblioteca que converte conteúdo HTML em PDF
const path = require('path'); // Módulo nativo do Node.js que lida com caminhos de arquivos e diretórios
const app = express(); // Cria uma instância do aplicativo Express
const https = require('https'); // Módulo para criar um servidor HTTPS, que permite conexões seguras
const fs = require('fs');  // Módulo de sistema de arquivos para manipulação de arquivos, como leitura e escrita
const cors = require('cors');  // Middleware para habilitar CORS, permitindo requisições de outros domínios
const helmet = require('helmet');  // Middleware que aumenta a segurança definindo cabeçalhos HTTP, como X-Frame-Options

const keyPath = 'ssl.key/server.key'; // Caminho para o arquivo de chave privada SSL (criptografia de dados recebidos de clientes)
const certPath = 'ssl.crt/server.crt'; // Caminho para o arquivo de certificado SSL (autenticação do servidor e criptografia de dados)

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) { // Verifica se os arquivos de chave e certificado SSL existem
  const sslOptions = {
    key: fs.readFileSync(keyPath), // Lê o arquivo da chave privada SSL
    cert: fs.readFileSync(certPath) // Lê o arquivo de certificado SSL
  };

  // Configura o CORS para permitir requisições de qualquer origem
  app.use(cors({
    origin: '*',  // Permite requisições de qualquer origem (todas as origens)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Permite esses métodos HTTP
    headers: ['Content-Type', 'Authorization']  // Permite esses cabeçalhos HTTP
  }));
  
  // Middleware que adiciona o cabeçalho Access-Control-Allow-Origin para permitir requisições de diferentes origens
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  // Permite qualquer domínio acessar a API
    next();  // Passa para o próximo middleware ou rota
  });

  app.use(express.json()); // Middleware para parsear JSON no corpo das requisições

  // Define o diretório público para servir arquivos estáticos (HTML, CSS, JS)
  app.use(express.static(path.join(__dirname, 'public')));

  // Lista de alvarás disponível para manipulação
const alvaras = [
    { id: 1, nome: 'Alvará de Licença para Construção', valor: 900.0 },
    { id: 2, nome: 'Alvará de Cadastramento de Imóvel', valor: 200.0 },
    { id: 3, nome: 'Alvará de Cancelamento de Inscrição', valor: 100.0 },
    { id: 4, nome: 'Alvará de Revisão do Imóvel', valor: 100.0 },
    { id: 5, nome: 'Alvará de Reativação do Imóvel', valor: 250.0 },
    { id: 6, nome: 'Alvará de Unificação dos Lotes', valor: 500.0 },
    { id: 7, nome: 'Alvará de Autorização Ambiental', valor: 600.0 },
    { id: 8, nome: 'Alvará de Cancelamento de Alvará', valor: 500.0 },
    { id: 9, nome: 'Alvará de Pré-Análise de Aprovação de Loteamentos', valor: 600.0 },
    { id: 10, nome: 'Alvará de Pré-Análise de Condomínios Horizontais', valor: 600.0 },
    { id: 11, nome: 'Alvará de Abertura de sub-lotes', valor: 600.0 },
    { id: 12, nome: 'Alvará de Solicitação de Alteração de Titularidade do Processo', valor: 600.0 },
    { id: 13, nome: 'Alvará de Certidão de alinhamento', valor: 600.0 },
    { id: 14, nome: 'Alvará de dimensões e confrontações', valor: 600.0 },
    { id: 15, nome: 'Alvará de Certidão de Uso e Ocupação do Solo', valor: 600.0 },
    { id: 16, nome: 'Alvará Auto Declaratório (Alvará 48h) para Canteiro de Obras', valor: 600.0 },
    { id: 17, nome: 'Alvará Auto Declaratório (Alvará 48h) para Construção de Muro', valor: 600.0 },
    { id: 18, nome: 'Alvará de Certidão de Vistoria Fiscal', valor: 600.0 },


];

 // Rota para servir a página inicial
 app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Envia o arquivo HTML estático
  });

  // Rota para listar todos os alvarás em JSON
  app.get('/alvaras', (req, res) => {
    res.json(alvaras); // Retorna a lista de alvarás como JSON
  });

  // Rota para gerar um boleto com base no ID do alvará selecionado
  app.post('/gerar-boleto', (req, res) => {
    const { alvaraId } = req.body; // Extrai o ID do alvará do corpo da requisição
    const alvara = alvaras.find(a => a.id === alvaraId); // Encontra o alvará correspondente
    if (!alvara) {
      return res.status(404).json({ error: 'Alvará não encontrado' }); // Retorna erro se não encontrar o alvará
    }

    const codigoBarras = `1234.56789.12345-${alvaraId}`; // Gera um código de barras baseado no ID do alvará
    const boleto = {
      valor: alvara.valor, // Define o valor do boleto baseado no valor do alvará
      codigoBarras: codigoBarras, // Adiciona o código de barras gerado
      vencimento: '17/10/2024', // Simula uma data de vencimento
    };

    res.json({ mensagem: 'Boleto gerado com sucesso', boleto }); // Retorna uma mensagem de sucesso e os dados do boleto
  });

  // Rota para simular o pagamento via Pix
  app.post('/pagar-pix', (req, res) => {
    const { codigoBarras } = req.body; // Extrai o código de barras da requisição
    const alvaraId = codigoBarras.split('-')[1]; // Extrai o ID do alvará a partir do código de barras
    const alvara = alvaras.find(a => a.id === parseInt(alvaraId)); // Encontra o alvará correspondente
    if (!alvara || codigoBarras !== `1234.56789.12345-${alvaraId}`) {
      return res.status(400).json({ error: 'Erro ao pagar o boleto via Pix' }); // Retorna erro se o código de barras for inválido
    }
    res.json({ mensagem: 'Pagamento via Pix confirmado' }); // Confirma o pagamento via Pix
  });

  // Rota para gerar o PDF de um alvará após o pagamento via Pix
  app.post('/gerar-pdf', (req, res) => {
    const { alvaraId } = req.body; // Extrai o ID do alvará do corpo da requisição
    const alvara = alvaras.find(a => a.id === alvaraId); // Encontra o alvará correspondente
    if (!alvara) {
      return res.status(404).json({ error: 'Alvará não encontrado' }); // Retorna erro se o alvará não for encontrado
    }

    // Cria o conteúdo HTML para ser convertido em PDF
    const html = `
      <div style="display: flex; align-items: center; justify-content: center; margin-top: 20px;">
        <img src="https://www.joaopessoa.pb.gov.br/google/assets/img/LOGO-PMJP-HORIZONTAL-PURA.jpg" alt="Brasão de João Pessoa" style="width: 80px; height: auto;"/>
        <h1 style="margin-left: 15px;">Prefeitura de João Pessoa</h1>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
        <h2 style="text-align: center;">Alvará Solicitado</h2>
        <p><strong>Nome:</strong> ${alvara.nome}</p>
        <p><strong>Valor:</strong> R$${alvara.valor.toFixed(2)}</p>
        <p><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Vencimento:</strong> 17/10/2024</p>
      </div>
    `;

    // Gera o PDF usando o conteúdo HTML
    pdf.create(html).toStream((err, stream) => {
      if (err) return res.status(500).send(err); // Retorna erro se a geração falhar
      res.setHeader('Content-Type', 'application/pdf'); // Define o cabeçalho da resposta como PDF
      stream.pipe(res); // Envia o PDF gerado para o cliente
    });
  });

  const PORT = 4001; // Define a porta do servidor
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Servidor rodando em https://localhost:4001`); // Inicia o servidor HTTPS
  });
} else {
  console.error('Arquivos de certificado SSL não encontrados'); // Exibe erro se os arquivos SSL não forem encontrados
  process.exit(1); // Encerra o processo
}
