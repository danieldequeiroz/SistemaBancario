import express from 'express'; // Framework web para criar APIs e gerenciar requisições.
import path from 'path'; // Módulo para manipular caminhos de arquivos e diretórios.
import https from 'https'; // Módulo para criar servidores HTTPS.
import fs from 'fs'; // Módulo para manipulação de arquivos no sistema.
import cors from 'cors'; // Middleware para habilitar CORS (Cross-Origin Resource Sharing).
import { fileURLToPath } from 'url'; // Utilitário para converter URLs para caminhos de arquivos.
import { dirname } from 'path'; // Método para obter o diretório atual de um arquivo.
import axios from 'axios'; // Biblioteca para fazer requisições HTTP (GET, POST, etc.).
import dotenv from 'dotenv'; // Módulo para carregar variáveis de ambiente de um arquivo `.env`.
import QRCode from 'qrcode'; // Biblioteca para gerar QR Codes.
import multer from 'multer'; // Middleware para upload de arquivos.
import pdf from 'pdf-parse'; // Biblioteca para extrair conteúdo de arquivos PDF.
import sharp from 'sharp'; // Biblioteca para manipulação de imagens (redimensionar, converter formatos, etc.).
import { PDFDocument } from 'pdf-lib'; // Biblioteca para criar e manipular arquivos PDF.
import { createCanvas, loadImage } from 'canvas'; // Módulos para desenhar gráficos em canvas e carregar imagens.
import Tesseract from 'tesseract.js'; // Biblioteca para realizar OCR (reconhecimento óptico de caracteres).


dotenv.config(); // Carrega as variáveis de ambiente definidas no arquivo `.env`.

// Obtém o caminho completo do arquivo atual (requerido no uso de módulos ES6).
const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename); // Obtém o diretório atual a partir do caminho do arquivo.

// Instância do Express para criar o servidor e gerenciar rotas.
const app = express();

const keyPath = 'ssl.key/server.key'; // Caminho para o arquivo da chave privada SSL.
const certPath = 'ssl.crt/server.crt'; // Caminho para o arquivo do certificado SSL.

const CLIENT_ID = process.env.CLIENT_ID; // ID do cliente, carregado das variáveis de ambiente.
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Secret do cliente, carregado das variáveis de ambiente.
const OAUTH2_ENDPOINT = 'https://oauth.sandbox.bb.com.br'; // Endpoint do OAuth2 para autenticação (sandbox do Banco do Brasil).
const API_ENDPOINT = 'https://api.sandbox.bb.com.br'; // Endpoint da API principal do Banco do Brasil em ambiente sandbox.

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|jpg|jpeg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF ou imagens são permitidos.'));
        }
    }
});

// Função para converter PDF em imagens
async function pdfToImages(pdfPath) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();
    const images = [];

    for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        // Renderizar a página no canvas
        const pngImage = await page.renderToPng(); // Verifique se este método é válido
        const img = await loadImage(pngImage);
        context.drawImage(img, 0, 0);

        // Salvar a imagem
        const imagePath = `page-${i + 1}.png`;
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(imagePath, buffer);
        images.push(imagePath);
    }

    return images;
}

// Função para extrair texto de uma imagem usando Tesseract
async function extractTextFromImage(imagePath) {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'por', {
            logger: info => console.log(info) // Log do progresso do reconhecimento
        });
        return text;
    } catch (error) {
        console.error('Erro ao extrair texto da imagem:', error);
        throw error;
    }
}

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) { 
    const sslOptions = {
        key: fs.readFileSync(keyPath), 
        cert: fs.readFileSync(certPath), 
    };

    app.use(cors({ 
        origin: '*', 
        methods: ['GET', 'POST'], 
        headers: ['Content-Type', 'Authorization'], 
    }));

    app.use(express.json()); 
    app.use(express.static(path.join(__dirname, 'public'))); 

    // Lista de alvarás disponíveis
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
        { id: 14, nome: 'Alvará de dimensões e confrontações', valor: 6.00 },
        { id: 15, nome: 'Alvará de Certidão de Uso e Ocupação do Solo', valor: 0.01 },
        { id: 16, nome: 'Alvará Auto Declaratório (Alvará 48h) para Canteiro de Obras', valor: 0.01},
        { id: 17, nome: 'Alvará Auto Declaratório (Alvará 48h) para Construção de Muro', valor: 0.01 },
    ];

    app.get('/alvaras', (req, res) => { 
        res.json(alvaras); 
    });

    // Rota para gerar pagamento via PIX
    app.post('/gerar-pix', async (req, res) => {
        const { alvaraId, email, identificationType, identificationNumber } = req.body;

        if (!email || !identificationType || !identificationNumber) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const alvara = alvaras.find(a => a.id === alvaraId);
        if (!alvara) {
            return res.status(404).json({ error: 'Alvará não encontrado' });
        }

        const pixData = { 
            valor: alvara.valor,
            chave: email,
            identificacao: {
                tipo: identificationType,
                numero: identificationNumber
            }
        };

        try {
            const paymentResponse = await gerarPixBancoDoBrasil(pixData);
            res.json({
                mensagem: 'Chave Pix gerada com sucesso',
                init_point: paymentResponse.qrCodeUrl,
                qrCode: paymentResponse.qrCodeBase64,
                valor: paymentResponse.valor,
                paymentId: paymentResponse.id
            });
        } catch (error) {
            console.error('Erro ao gerar chave Pix:', error);
            const randomPixKey = `chave-pix-${Math.random().toString(36).substring(2, 15)}`;
            const genericPixData = `Valor: ${pixData.valor} - Chave: ${randomPixKey}`;
            const qrCodeOptions = {
                width: 300,
                margin: 1,
            };
            const qrCodeBase64 = await QRCode.toDataURL(genericPixData, qrCodeOptions);
            res.json({
                mensagem: 'Erro ao gerar chave Pix, mas aqui está um QR Code genérico.',
                init_point: randomPixKey,
                qrCode: qrCodeBase64,
                valor: pixData.valor,
            });
        }
    });

// Rota para verificar o status do pagamento
app.post('/verificar-pagamento', async (req, res) => {
    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ error: 'O ID do pagamento é obrigatório' });
    }

    // Verifica se o paymentId corresponde ao padrão desejado
    const foundIds = paymentId.match(/[A-Za-z0-9£]{32,40}/g);
    if (!foundIds || foundIds.length === 0) {
        return res.status(400).json({ error: 'O ID do pagamento deve ter entre 32 e 40 caracteres alfanuméricos.' });
    }

    try {
        const paymentStatus = await verificarPagamento(paymentId);
        res.json(paymentStatus);
    } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        res.status(500).json({ error: 'Erro ao verificar pagamento' });
    }
});

// Função para verificar o status do pagamento
async function verificarPagamento(paymentId) {
    // Verifica se o paymentId corresponde ao formato desejado
    const isValidId = paymentId.match(/[A-Za-z0-9£]{32,40}/);
    
    if (isValidId) {
        // Aqui você pode simular um pagamento bem-sucedido ou não
        // Para fins de exemplo, vamos considerar que IDs que começam com 'E' são pagos
        if (paymentId.startsWith('E')) {
            return {
                id: paymentId,
                status: 'Pago',
                valor: 0.01, // Valor de exemplo
                data: new Date().toISOString(),
            };
        } else {
            return {
                id: paymentId,
                status: 'Não encontrado',
                valor: 0,
                data: new Date().toISOString(),
            };
        }
    }

    // Se o ID não for válido, retorna um status de "Não encontrado"
    return {
        id: paymentId,
        status: 'Não encontrado',
        valor: 0,
        data: new Date().toISOString(),
    };




        const accessToken = await obterAccessToken();

        try {
            const response = await axios.get(`${API_ENDPOINT}/pagamentos/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao verificar pagamento:', error);
            throw error;
        }
    }

    // Função para obter o access token
    async function obterAccessToken() {
        const authResponse = await axios.post(`${OAUTH2_ENDPOINT}/oauth/token`, null, {
            params: {
                grant_type: 'client_credentials',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        return authResponse.data.access_token;
    }

    // Rota para o indexcomprovante.html
    app.get('/indexcomprovante', (req, res) => {
        res.sendFile(path.join(__dirname, 'indexcomprovante.html')); 
    });

   // Rota para upload do comprovante
app.post('/upload-comprovante', upload.single('comprovante'), (req, res) => {
    console.log('Rota de upload chamada');
    console.log('req.file:', req.file); // Log do arquivo recebido


    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado ou tipo de arquivo inválido.', status: 'Pendente' });
    }

    console.log('Arquivo recebido:', req.file);
    const filePath = req.file.path;

    if (path.extname(req.file.originalname).toLowerCase() === '.pdf') {
        // Processar PDF
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao ler o arquivo.', status: 'Pendente' });
            }

            pdf(data).then((pdfData) => {
                const content = pdfData.text;
                console.log('Texto extraído do PDF:', content); // Log do texto extraído
                const foundIds = content.match(/[A-Za-z0-9£]{32,40}/g); // Ajuste o padrão conforme necessário
                if (foundIds && foundIds.length > 0) {
                    res.json({ message: 'Comprovante enviado com sucesso! pagamento identificado.', foundIds, status: 'Pago' });
                } else {
                    res.json({ error: 'Nenhum ID encontrado no comprovante.', foundIds: [], status: 'Pendente' });
                }

                fs.unlink(filePath, (err) => {
                    if (err) console.error('Erro ao deletar o arquivo:', err);
                });
            }).catch(err => {
                console.error('Erro ao processar o PDF:', err);
                res.status(500).json({ error: 'Erro ao processar o PDF.', foundIds: [], status: 'Pendente' });
            });
        });
    } else {
        // Processar imagem
        console.log('Processando imagem...');
        sharp(filePath)
            .resize(1200, 1200)
            .grayscale()
            .normalize()
            .toFile(`uploads/resized-${req.file.filename}`, (err, info) => {
                if (err) {
                    console.error('Erro ao processar a imagem:', err);
                    return res.status(500).json({ error: 'Erro ao processar a imagem.', foundIds: [], status: 'Pendente' });
                }
                console.log('Imagem redimensionada com sucesso:', info);

                Tesseract.recognize(
                    `uploads/resized-${req.file.filename}`,
                    'por',
                    {
                        logger: info => console.log(info)
                    }
                ).then(({ data: { text } }) => {
                    console.log('Texto extraído da imagem:', text); // Log do texto extraído
                    const foundIds = text.match(/[A-Za-z0-9£]{32,40}/g); // Ajuste o padrão conforme necessário
                    if (foundIds && foundIds.length > 0) {
                        res.json({ message: 'Comprovante enviado e IDs encontrados na imagem!', foundIds, status: 'Pago' });
                    } else {
                        res.json({ error: 'Nenhum ID encontrado na imagem.', foundIds: [], status: 'Pendente' });
                    }
                }).catch(err => {
                    console.error('Erro ao processar a imagem:', err);
                    res.status(500).json({ error: 'Erro ao processar a imagem.', foundIds: [], status: 'Pendente' });
                });
            });
    }
});

    const PORT = 3001;

    https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`Servidor rodando em https://localhost:${PORT}`);
    });
} else {
    console.error('Arquivos de certificado SSL não encontrados');
    process.exit(1);
}

// Função para gerar PIX no Banco do Brasil
async function gerarPixBancoDoBrasil(pixData) {
    const authResponse = await axios.post(`${OAUTH2_ENDPOINT}/oauth/token`, null, {
        params: {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });

    const accessToken = authResponse.data.access_token;

    const pixTransaction = {
        valor: pixData.valor,
        chave: pixData.chave,
        // Outros parâmetros necessários para a transação PIX
    };

    const transactionResponse = await axios.post(`${API_ENDPOINT}/pix`, pixTransaction, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    return {
        qrCodeUrl: transactionResponse.data.qrCodeUrl,
        qrCodeBase64: transactionResponse.data.qrCodeBase64,
        valor: transactionResponse.data.valor,
        id: transactionResponse.data.id,
    };
}

// Rota para upload de imagem
app.post('/upload-imagem', upload.single('comprovante'), (req, res) => {
    console.log('Rota de upload de imagem chamada');

    console.log('req.file:', req.file); // Log do arquivo recebido


    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada ou tipo de arquivo inválido.', status: 'Pendente' });
    }

    console.log('Arquivo de imagem recebido:', req.file);
    console.log('Tipo MIME do arquivo:', req.file.mimetype);

    const filePath = req.file.path;

    sharp(filePath)
        .resize(1200, 1200)
        .grayscale()
        .normalize()
        .toFile(`uploads/resized-${req.file.filename}`, (err, info) => {
            if (err) {
                console.error('Erro ao processar a imagem:', err);
                return res.status(500).json({ error: 'Erro ao processar a imagem.', status: 'Pendente' });
            }
            console.log('Imagem redimensionada com sucesso:', info);

            Tesseract.recognize(
                `uploads/resized-${req.file.filename}`,
                'por',
                {
                    logger: info => console.log(info)
                }
            ).then(({ data: { text } }) => {
                console.log('Texto extraído:', text);
                const foundIds = idsToCheck.filter(id => text.includes(id));
                if (foundIds.length > 0) {
                    res.json({ message: 'Comprovante enviado e IDs encontrados na imagem!', foundIds, status: 'Pago' });
                } else {
                    res.json({ error: 'Nenhum ID encontrado na imagem.', foundIds: [], status: 'Pendente' });
                }
            }).catch(err => {
                console.error('Erro ao processar a imagem:', err);
                res.status(500).json({ error: 'Erro ao processar a imagem.', foundIds: [], status: 'Pendente' });
            }); // Aqui está o fechamento correto
        }); // Fechamento da função toFile
});
