import express from 'express'; // Importa o framework Express para construção de APIs.
import path from 'path'; // Importa o módulo de manipulação de caminhos de arquivos.
import https from 'https'; // Importa o módulo HTTPS para configurar um servidor seguro.
import fs from 'fs'; // Importa o módulo de sistema de arquivos para verificar e ler arquivos.
import cors from 'cors'; // Importa o módulo CORS para configurar o acesso de outras origens.
import { MercadoPagoConfig, Payment } from 'mercadopago'; // Importa classes para integração com o Mercado Pago.
import { fileURLToPath } from 'url'; // Importa método para obter o caminho do arquivo atual em módulos ES.
import { dirname } from 'path'; // Importa método para obter o diretório do arquivo atual.

const __filename = fileURLToPath(import.meta.url); // Define a variável __filename com o caminho completo do arquivo atual.
const __dirname = dirname(__filename); // Define __dirname com o diretório atual do arquivo.

const app = express(); // Inicializa o aplicativo Express.

const keyPath = 'ssl.key/server.key'; // Define o caminho do arquivo de chave privada para SSL.
const certPath = 'ssl.crt/server.crt'; // Define o caminho do arquivo de certificado para SSL.

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) { // Verifica se os arquivos de chave e certificado existem.
    const sslOptions = {
        key: fs.readFileSync(keyPath), // Lê o arquivo de chave privada.
        cert: fs.readFileSync(certPath), // Lê o arquivo de certificado.
    };

    app.use(cors({ // Configura o middleware de CORS para permitir acesso externo.
        origin: '*', // Permite qualquer origem acessar o servidor.
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permite apenas esses métodos HTTP.
        headers: ['Content-Type', 'Authorization'], // Define os cabeçalhos permitidos.
    }));

    app.use(express.json()); // Configura o middleware para parsear requisições com JSON.
    app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta 'public'.


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
        { id: 15, nome: 'Alvará de Certidão de Uso e Ocupação do Solo', valor: 0.01},
        { id: 16, nome: 'Alvará Auto Declaratório (Alvará 48h) para Canteiro de Obras', valor: 0.01 },
        { id: 17, nome: 'Alvará Auto Declaratório (Alvará 48h) para Construção de Muro', valor: 0.01},
    ];

    app.get('/alvaras', (req, res) => { // Rota GET para obter a lista de alvarás.
        res.json(alvaras); // Retorna a lista de alvarás em formato JSON.
    });
    
    app.post('/gerar-pix', async (req, res) => { // Rota POST para gerar um pagamento via Pix.
        console.log('Dados recebidos:', req.body); // Log dos dados recebidos na requisição.
        const { alvaraId, email, identificationType, identificationNumber } = req.body; // Desestrutura os dados recebidos.
    
        // Verificação de dados
        if (!email || !identificationType || !identificationNumber) { // Checa se todos os campos obrigatórios estão preenchidos.
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' }); // Retorna erro 400 se algum campo estiver faltando.
        }
    
        const alvara = alvaras.find(a => a.id === alvaraId); // Busca o alvará correspondente pelo ID.
        if (!alvara) { // Verifica se o alvará foi encontrado.
            return res.status(404).json({ error: 'Alvará não encontrado' }); // Retorna erro 404 se o alvará não existir.
        }
    
        const body = { // Cria o corpo da requisição para o Mercado Pago.
            transaction_amount: alvara.valor, // Valor da transação baseado no valor do alvará.
            description: alvara.nome, // Descrição da transação com o nome do alvará.
            payment_method_id: 'pix', // Método de pagamento definido como Pix.
            payer: {
                email: email, // Email do pagador.
                identification: {
                    type: identificationType, // Tipo de identificação (e.g., CPF ou CNPJ).
                    number: identificationNumber // Número da identificação.
                }
            }
        };
    
        console.log('Corpo da requisição para a API do Mercado Pago:', body); // Log do corpo da requisição para o Mercado Pago.
    
        try {
            const paymentResponse = await payment.create({ body }); // Envia a requisição para criar um pagamento via Mercado Pago.
            console.log('Resposta do Mercado Pago:', paymentResponse); // Log da resposta do Mercado Pago.
    
            if (!paymentResponse || paymentResponse.api_response.status !== 201) { // Verifica se a resposta é válida e se o status é 201.
                throw new Error('Resposta da API é indefinida ou inválida'); // Lança um erro se a resposta for inválida.
            }
    
            res.json({ // Retorna a resposta com dados do Pix se o pagamento for criado com sucesso.
                mensagem: 'Chave Pix gerada com sucesso',
                init_point: paymentResponse.point_of_interaction.transaction_data.qr_code, // Link para o QR Code.
                qrCode: paymentResponse.point_of_interaction.transaction_data.qr_code_base64, // Imagem do QR Code em Base64.
                valor: paymentResponse.transaction_amount, // Valor da transação.
                paymentId: paymentResponse.id // ID do pagamento gerado.
            });
        } catch (error) {
            console.error('Erro ao gerar chave Pix:', error.response ? error.response.body : error); // Log do erro se ocorrer uma falha.
            res.status(500).json({ error: error.response ? error.response.body : 'Erro ao gerar chave Pix' }); // Retorna erro 500 com mensagem apropriada.
        }
    });
    
    // Novo endpoint para verificar o status do pagamento
app.get('/verificar-pagamento/:paymentId', async (req, res) => { // Rota GET para checar o status de um pagamento específico.
    const paymentId = req.params.paymentId; // Obtém o ID do pagamento dos parâmetros da URL.

    if (!paymentId) { // Verifica se o ID do pagamento foi fornecido.
        return res.status(400).json({ error: 'O ID do pagamento é obrigatório.' }); // Retorna erro 400 se o ID estiver ausente.
    }

    try {
        const paymentStatusResponse = await payment.get({ id: paymentId }); // Solicita o status do pagamento via API.
        console.log('Resposta do status do pagamento:', paymentStatusResponse); // Log da resposta do status.

        if (!paymentStatusResponse || paymentStatusResponse.api_response.status !== 200) { // Verifica se a resposta da API é válida e bem-sucedida.
            throw new Error('Resposta da API é indefinida ou inválida'); // Lança um erro se a resposta for inválida.
        }

        res.json({ // Retorna o status do pagamento se a solicitação for bem-sucedida.
            mensagem: 'Status do pagamento:',
            status: paymentStatusResponse.status, // Inclui o status atual do pagamento na resposta.
        });
    } catch (error) {
        console.error('Erro ao verificar o status do pagamento:', error.response ? error.response.body : error); // Log do erro se houver falha.
        res.status(500).json({ error: error.response ? error.response.body : 'Erro ao verificar o status do pagamento' }); // Retorna erro 500 se houver problema na solicitação.
    }
});

// Novo endpoint para capturar pagamentos
app.post('/capturar-pagamento', async (req, res) => { // Rota POST para capturar um pagamento específico.
    const { paymentId } = req.body; // Extrai o ID do pagamento do corpo da requisição.

    if (!paymentId) { // Verifica se o ID do pagamento foi fornecido.
        return res.status(400).json({ error: 'O ID do pagamento é obrigatório.' }); // Retorna erro 400 se o ID estiver ausente.
    }

    try {
        const captureResponse = await payment.capture({ // Solicita a captura do pagamento via API.
            id: paymentId, // Define o ID do pagamento a ser capturado.
            requestOptions: { idempotencyKey: new Date().getTime().toString() } // Gera uma chave de idempotência única para evitar capturas duplicadas.
        });

        console.log('Resposta da captura:', captureResponse); // Log da resposta da captura.
        res.json({ // Retorna resposta de sucesso se o pagamento for capturado.
            mensagem: 'Pagamento capturado com sucesso!',
            status: captureResponse.status, // Inclui o status da captura na resposta.
            transactionId: captureResponse.id, // Inclui o ID da transação na resposta.
        });
    } catch (error) {
        console.error('Erro ao capturar o pagamento:', error.response ? error.response.body : error); // Log do erro se houver falha na captura.
        res.status(500).json({ error: error.response ? error.response.body : 'Erro ao capturar o pagamento' }); // Retorna erro 500 se houver problema na solicitação.
    }
});

const PORT = 4001; // Define a porta em que o servidor irá rodar.

https.createServer(sslOptions, app).listen(PORT, () => { // Cria um servidor HTTPS usando as opções SSL e o app Express.
    console.log(`Servidor rodando em https://localhost:4001`); // Exibe uma mensagem no console com o endereço do servidor.
});
} else { // Caso os arquivos de certificado SSL não estejam presentes.
    console.error('Arquivos de certificado SSL não encontrados'); // Exibe uma mensagem de erro no console.
    process.exit(1); // Encerra o processo com um código de erro.
}
