import express from 'express';
import path from 'path';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import { MercadoPagoConfig, Payment } from 'mercadopago'; 
import { fileURLToPath } from 'url'; 
import { dirname } from 'path'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const keyPath = 'ssl.key/server.key';
const certPath = 'ssl.crt/server.crt';

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const sslOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
    };

    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization'],
    }));

    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));

    // Configuração do Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: 'APP_USR-3829660347869859-102309-9b6e68d21c73ba10440cce5d48bb60d1-430206286' });
    const payment = new Payment(client); // Criação da instância do Payment

    const alvaras = [
        { id: 1, nome: 'Alvará de Licença para Construção', valor: 1.00 },
        { id: 2, nome: 'Alvará de Cadastramento de Imovel', valor: 2.00 },
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
        { id: 13, nome: 'Alvará de Certidão de alinhamento', valor: 6.00 },
        { id: 14, nome: 'Alvará de dimensões e confrontações', valor: 6.00},
        { id: 15, nome: 'Alvará de Certidão de Uso e Ocupação do Solo', valor: 6.00},
        { id: 16, nome: 'Alvará Auto Declaratório (Alvará 48h) para Canteiro de Obras', valor: 6.00 },
        { id: 17, nome: 'Alvará Auto Declaratório (Alvará 48h) para Construção de Muro', valor: 0.01},
    ];

    app.get('/alvaras', (req, res) => {
        res.json(alvaras);
    });

    app.post('/gerar-pix', async (req, res) => {
        console.log('Dados recebidos:', req.body);
        const { alvaraId, email, identificationType, identificationNumber } = req.body;

        // Verificação de dados
        if (!email || !identificationType || !identificationNumber) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const alvara = alvaras.find(a => a.id === alvaraId );
        if (!alvara) {
            return res.status(404).json({ error: 'Alvará não encontrado' });
        }

        const body = {
            transaction_amount: alvara.valor,
            description: alvara.nome,
            payment_method_id: 'pix',
            payer: {
                email: email,
                identification: {
                    type: identificationType,
                    number: identificationNumber
                }
            }
        };

        console.log('Corpo da requisição para a API do Mercado Pago:', body); // Log do corpo

        try {
            const paymentResponse = await payment.create({ body });
            console.log('Resposta do Mercado Pago:', paymentResponse);
    
            if (!paymentResponse || paymentResponse.api_response.status !== 201) {
                throw new Error('Resposta da API é indefinida ou inválida');
            }
    
            res.json({
                mensagem: 'Chave Pix gerada com sucesso',
                init_point: paymentResponse.point_of_interaction.transaction_data.qr_code,
                qrCode: paymentResponse.point_of_interaction.transaction_data.qr_code_base64,
                valor: paymentResponse.transaction_amount,
                paymentId: paymentResponse.id // Armazena o ID do pagamento
            });
        } catch (error) {
            console.error('Erro ao gerar chave Pix:', error.response ? error.response.body : error);
            res.status(500).json({ error: error.response ? error.response.body : 'Erro ao gerar chave Pix' });
        }
    });

    // Novo endpoint para verificar o status do pagamento
    app.get('/verificar-pagamento/:paymentId', async (req, res) => {
        const paymentId = req.params.paymentId;

        if (!paymentId) {
            return res.status(400).json({ error: 'O ID do pagamento é obrigatório.' });
        }

        try {
            const paymentStatusResponse = await payment.get({ id: paymentId });
            console.log('Resposta do status do pagamento:', paymentStatusResponse);

            if (!paymentStatusResponse || paymentStatusResponse.api_response.status !== 200) {
                throw new Error('Resposta da API é indefinida ou inválida');
            }

            res.json({
                mensagem: 'Status do pagamento:',
                status: paymentStatusResponse.status,
            });
        } catch (error) {
            console.error('Erro ao verificar o status do pagamento:', error.response ? error.response.body : error);
            res.status(500).json({ error: error.response ? error.response.body : 'Erro ao verificar o status do pagamento' });
        }
    });

    // Novo endpoint para capturar pagamentos
    app.post('/capturar-pagamento', async (req, res) => {
        const { paymentId } = req.body; // Recebe o ID do pagamento do corpo da requisição

        if (!paymentId) {
            return res.status(400).json({ error: 'O ID do pagamento é obrigatório.' });
        }

        try {
            const captureResponse = await payment.capture({
                id: paymentId,
                requestOptions: { idempotencyKey: new Date().getTime().toString() } // Gerar um ID único
            });

            console.log('Resposta da captura:', captureResponse);
            res.json({
                mensagem: 'Pagamento capturado com sucesso!',
                status: captureResponse.status,
                transactionId: captureResponse.id,
            });
        } catch (error) {
            console.error('Erro ao capturar o pagamento:', error.response ? error.response.body : error);
            res.status(500).json({ error: error.response ? error.response.body : 'Erro ao capturar o pagamento' });
        }
    });

    const PORT = 4001;
    https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`Servidor rodando em https://localhost:4001`);
    });
} else {
    console.error('Arquivos de certificado SSL não encontrados');
    process.exit(1);
}
