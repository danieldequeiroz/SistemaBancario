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

## ENGLISH

# # Payment Permit System with Payment Generation via PIX

This project is a payment permit management system that allows uploading payment receipts and generating payments via PIX. The system uses Tesseract.js to extract text from images and PDFs, in addition to other libraries for file manipulation and communication with APIs.

## Features

- **Receipt Upload**: Allows uploading PDF files and images (JPG, PNG) as payment receipts.
- **Text Extraction**: Uses Tesseract.js to extract text from images and PDFs.
- **Payment Generation via PIX**: Integration with Banco do Brasil's API to generate payments via PIX.
- **Payment Verification**: Verifies whether payments were identified based on the IDs provided.

## Technologies Used

- **Node.js**: Execution environment for the server.
- **Express**: Framework for building APIs.
- **Multer**: Middleware for handling file uploads.
- **Sharp**: Library for image processing.
- **Tesseract.js**: Library for optical character recognition (OCR).
- **PDF-Parse**: Library for extracting text from PDF files.
- **Axios**: HTTP client for making requests to external APIs.
- **dotenv**: For managing environment variables.

## Prerequisites

- Node.js (v14 or higher)
- SSL certificates (for running on HTTPS)
- Banco do Brasil account to access the PIX payment API

## Installation

1. Clone the repository:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

2. Install the dependencies:

```bash
npm install

3. Create a .env file in the project root and add your credentials:

```bash
CLIENT_ID=seu_client_id
CLIENT_SECRET=seu_client_secret

4. Since it is running on HTTPS (DUE TO THE CENTRAL BANK RULES, ALL BANK APIS) YOU NEED TO GENERATE A PERSONAL HTTPS CERTIFICATE ON YOUR COMPUTER. Also, make sure that the uploads/ and ssl.key/ directories exist and that the SSL certificates are in the correct directory.

## EXECUTION

1- it is running inside the Docker container: docker run -d -p 3000:3000 --name sistemabancario bancodobrasil

2- docker ps

Step 5: after cloning the repository, install npm install express body-parser html-pdf

Step 6: If you don't have Postman, install it: You can download it at https://www.postman.com/downloads/.

Step 7: Open Postman and create a new request.
Set the request method to POST.
In the URL field, enter http://localhost:4000/gerar-boleto.

Go to the "Body" tab, select raw and then JSON.
In the request body, insert the following JSON (adjusting the alvaraId according to what is available in your system):
{
"alvaraId": 1
}
or
{
"alvaraId": 2
}
Click Send to send the request and check the response.
Expected response: {
"message": "Boleto generated successfully",
"boleto": {
"value": 100,
"codigoBarras": "1234.56789.12345-1",
"due date": "10/10/2024"
}
}
Step 8: Simulate Payment via Pix: Now that you have the boleto barcode, you can simulate payment via Pix. To do so, send a POST request to the /pagar-pix endpoint with the generated barcode.

In Postman, set up a new request:
Method: POST
URL: http://localhost:4000/pagar-pix
Request body (JSON):

{
"codigoBarras": "1234.56789.12345-1"
}

If the payment is successful, you should receive a message confirming the payment.

Step 9: Generate the PDF of the Alvará: After the payment is confirmed, you can generate the PDF of the requested alvará. To do this, send a POST request to the /gerar-pdf endpoint, passing the ID of the alvará that you selected previously.

In Postman, set up another request: Method: POST URL: http://localhost:4000/generate-pdf
Request body (JSON):

{
"alvaraId": 1
}

or

{
"alvaraId": 2
}

This will generate the PDF of the license, and the PDF will be returned as a response, allowing you to download the document.

Step 6: Final Verification:

If all steps are working correctly, you will be able to view the generated PDF of the license and download it.












