# # Sistema de Alvará com Geração de Pagamentos via PIX

Este projeto é um sistema de gerenciamento de alvarás que permite o upload de comprovantes de pagamento e a geração de pagamentos via PIX. O sistema utiliza o Tesseract.js para extração de texto de imagens e PDFs, além de outras bibliotecas para manipulação de arquivos e comunicação com APIs.

## Funcionalidades

- **Upload de Comprovantes**: Permite o upload de arquivos PDF e imagens (JPG, PNG) como comprovantes de pagamento.
- **Extração de Texto**: Utiliza Tesseract.js para extrair texto de imagens e PDFs.
- **Geração de Pagamentos via PIX**: Integração com a API do Banco do Brasil para gerar pagamentos via PIX.
- **Verificação de Pagamentos**: Verifica se os pagamentos foram identificados com base nos IDs fornecidos.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução para o servidor.
- **Express**: Framework para construção de APIs.
- **Multer**: Middleware para manipulação de uploads de arquivos.
- **Sharp**: Biblioteca para processamento de imagens.
- **Tesseract.js**: Biblioteca para reconhecimento óptico de caracteres (OCR).
- **PDF-Parse**: Biblioteca para extração de texto de arquivos PDF.
- **Axios**: Cliente HTTP para fazer requisições a APIs externas.
- **dotenv**: Para gerenciar variáveis de ambiente.

## Pré-requisitos

- Node.js (v14 ou superior)
- Certificados SSL (para execução em HTTPS)
- Conta no Banco do Brasil para acesso à API de pagamentos via PIX

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio

   
2. Instale as dependências:
   

   ```bash
   npm install


3. Crie um arquivo .env na raiz do projeto e adicione suas credenciais:

   ```bash
   CLIENT_ID=seu_client_id
   CLIENT_SECRET=seu_client_secret

4. Como esta rodando em HTTPS (POR REGRA DO BANCO CENTRAL, TODA API DE BANCO )  PRECISA GERAR O CERTIFICADO HTTPS PESSOAL NO SEU COMPUTADOR. Além disso, Certifique-se de que os diretórios uploads/ e ssl.key/ existem e que os certificados SSL estão no diretório correto.

## EXECUÇÃO

1- esta rodando dentro do conteiner de Docker : docker run -d -p 3000:3000 --name sistemabancario bancodobrasil

2- docker ps

Passo 5: depois de clonar o repositório instale npm install express body-parser html-pdf

Passo 6: Senão tiver o Postman instale: Você pode baixá-lo em https://www.postman.com/downloads/.

Passo 7: Abra o Postman e crie uma nova requisição.
Defina o método da requisição como POST.
No campo de URL, insira http://localhost:4000/gerar-boleto.
Vá até a aba "Body", selecione raw e depois JSON.
No corpo da requisição, insira o seguinte JSON (ajustando o alvaraId conforme o que está disponível no seu sistema):
{
  "alvaraId": 1
}
ou
{
  "alvaraId": 2
}
Clique em Send para enviar a requisição e verificar a resposta.
Resposta esperada: {
  "mensagem": "Boleto gerado com sucesso",
  "boleto": {
    "valor": 100,
    "codigoBarras": "1234.56789.12345-1",
    "vencimento": "10/10/2024"
  }
}


Passo 8: Simular o Pagamento via Pix: Agora que você tem o código de barras do boleto, pode simular o pagamento via Pix. Para isso, envie uma requisição POST para o endpoint /pagar-pix com o código de barras gerado.

No Postman, configure uma nova requisição:
Método: POST
URL: http://localhost:4000/pagar-pix
Corpo da requisição (JSON): 

{
  "codigoBarras": "1234.56789.12345-1"
}

Se o pagamento for bem-sucedido, você deve receber uma mensagem confirmando o pagamento.

Passo 9: Gerar o PDF do Alvará: Após o pagamento ser confirmado, você pode gerar o PDF do alvará solicitado. Para isso, envie uma requisição POST para o endpoint /gerar-pdf, passando o ID do alvará que você selecionou anteriormente.

No Postman, configure outra requisição: Método: POST URL: http://localhost:4000/gerar-pdf
Corpo da requisição (JSON): 

{
  "alvaraId": 1
}

ou

{
  "alvaraId": 2
}

Isso irá gerar o PDF do alvará, e o PDF será retornado como resposta, permitindo que você baixe o documento.

Passo 6: Verificação Final:

Caso todas as etapas estejam funcionando corretamente, você poderá visualizar o PDF do alvará gerado e fazer o download.












