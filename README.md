# Sistema Bancario

Passo 1:  depois de clonar o repositório instale npm install express body-parser html-pdf

Passo 2: Senão tiver o Postman instale: Você pode baixá-lo em https://www.postman.com/downloads/.

Passo 3: Abra o Postman e crie uma nova requisição.
Defina o método da requisição como POST.
No campo de URL, insira http://localhost:4000/gerar-boleto.
Vá até a aba "Body", selecione raw e depois JSON.
No corpo da requisição, insira o seguinte JSON (ajustando o alvaraId conforme o que está disponível no seu sistema):{
  "alvaraId": 1
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
Passo 4: Simular o Pagamento via Pix: Agora que você tem o código de barras do boleto, pode simular o pagamento via Pix. Para isso, envie uma requisição POST para o endpoint /pagar-pix com o código de barras gerado.

No Postman, configure uma nova requisição:
Método: POST
URL: http://localhost:4000/pagar-pix
Corpo da requisição (JSON): {
  "codigoBarras": "1234.56789.12345-1"
}
Se o pagamento for bem-sucedido, você deve receber uma mensagem confirmando o pagamento.

Passo 5: Gerar o PDF do Alvará: Após o pagamento ser confirmado, você pode gerar o PDF do alvará solicitado. Para isso, envie uma requisição POST para o endpoint /gerar-pdf, passando o ID do alvará que você selecionou anteriormente.

No Postman, configure outra requisição:
Método: POST
URL: http://localhost:4000/gerar-pdf
Corpo da requisição (JSON): {
  "alvaraId": 1
}
Isso irá gerar o PDF do alvará, e o PDF será retornado como resposta, permitindo que você baixe o documento.

Passo 6: Verificação Final:

Caso todas as etapas estejam funcionando corretamente, você poderá visualizar o PDF do alvará gerado e fazer o download.












