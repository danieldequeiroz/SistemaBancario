const express = require('express');
const bodyParser = require('body-parser');
const pdf = require('html-pdf');
const path = require('path');

const app = express();
app.use(express.json());

// Define a pasta para arquivos estáticos (como HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados simulado
const alvaras = [
    { id: 1, nome: 'Alvará de Construção', valor: 100.0 },
    { id: 2, nome: 'Alvará de Funcionamento', valor: 200.0 },
];

// Rota para a página inicial, enviando o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serve o arquivo index.html
});

// Rota para listar alvarás
app.get('/alvaras', (req, res) => {
    res.json(alvaras);
});

// Rota para gerar boleto
app.post('/gerar-boleto', (req, res) => {
    const { alvaraId } = req.body;
    console.log('Requisição recebida:', alvaraId);  // Verificar se o alvaraId está chegando

    const alvara = alvaras.find(a => a.id === alvaraId);
    if (!alvara) {
        return res.status(404).json({ error: 'Alvará não encontrado' });
    }

    // Simulando a geração do boleto
    const boleto = {
        valor: alvara.valor,
        codigoBarras: `1234.56789.12345-${alvaraId}`,  // Código de barras fictício
        vencimento: '10/10/2024',
    };

    res.json({ mensagem: 'Boleto gerado com sucesso', boleto });
});


// Simulação de pagamento via Pix
app.post('/pagar-pix', (req, res) => {
    const { codigoBarras } = req.body;

    // Simulando a validação do pagamento
    if (codigoBarras !== '1234.56789.12345-1') {
        return res.status(400).json({ error: 'Erro ao pagar o boleto via Pix' });
    }

    res.json({ mensagem: 'Pagamento via Pix confirmado' });
});

// Geração do PDF após o pagamento via Pix
app.post('/gerar-pdf', (req, res) => {
    const { alvaraId } = req.body;
    const alvara = alvaras.find(a => a.id === alvaraId);
    if (!alvara) {
        return res.status(404).json({ error: 'Alvará não encontrado' });
    }

    // Gerando o conteúdo HTML do PDF
    const html = `
        <h1>Alvará Solicitado</h1>
        <p>Nome: ${alvara.nome}</p>
        <p>Valor: R$${alvara.valor}</p>
        <p>Data de Emissão: ${new Date().toLocaleDateString()}</p>
    `;

    // Gerando o PDF
    pdf.create(html).toStream((err, stream) => {
        if (err) return res.status(500).send(err);
        res.setHeader('Content-Type', 'application/pdf');
        stream.pipe(res);
    });
});

// Iniciar o servidor
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:4000`);
});
