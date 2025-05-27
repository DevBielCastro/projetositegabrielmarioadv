"Gabriel Mário Advocacia"
&lt;div align="center">
&lt;h1>Website e Painel Administrativo - Gabriel Mário Advocacia&lt;/h1>
&lt;/div>

&lt;p align="center">
&lt;em>Website institucional moderno, dinâmico e interativo para o Dr. Gabriel Mário, advogado com atuação em Direito Estratégico. O projeto inclui um blog jurídico com conteúdo gerenciável através de um painel administrativo dedicado.&lt;/em>
&lt;/p>

&lt;p align="center">
&lt;img src="[link suspeito removido]" alt="Node.js">
&lt;img src="[link suspeito removido]" alt="Express.js">
&lt;img src="[link suspeito removido]" alt="MongoDB">
&lt;img src="[link suspeito removido]" alt="Tailwind CSS">
&lt;img src="[link suspeito removido]" alt="Alpine.js">
&lt;img src="[link suspeito removido]" alt="Docker">
&lt;/p>

📋 Índice
Visão Geral do Projeto
✨ Funcionalidades Principais
🛠️ Tecnologias Utilizadas
⚙️ Pré-requisitos
🚀 Configuração e Execução
Clonando o Repositório
Instalando Dependências
Configurando Variáveis de Ambiente
Rodando a Aplicação Localmente
🐳 Rodando com Docker (Opcional)
📁 Estrutura do Projeto
🤝 Contribuições
📜 Licença
📝 Visão Geral do Projeto
Este projeto tem como objetivo fornecer uma presença online robusta e profissional para o Dr. Gabriel Mário, destacando sua expertise em Direito Estratégico, especialmente nas áreas de Saúde, Imobiliário e Previdenciário. O website é desenhado para ser informativo, moderno e de fácil navegação, complementado por um blog para disseminação de conhecimento jurídico.

O sistema é composto por:

Frontend (Website Público): Uma interface pública (index.html) com seções detalhadas sobre o advogado, suas áreas de atuação interativas (utilizando Alpine.js para o efeito de "acordeão") e uma listagem de artigos recentes carregados dinamicamente. Inclui também uma página individual (blog/post.html) para a leitura completa dos artigos.
Painel Administrativo: Uma área restrita (admin.html) acessível via login por token, permitindo ao Dr. Gabriel gerenciar completamente os artigos do blog (criar, visualizar, editar e excluir posts, incluindo upload de imagens de capa).
Backend (API RESTful): Construído com Node.js e Express.js, este servidor gerencia a lógica de negócios, a persistência de dados dos artigos no MongoDB (via Mongoose) e a autenticação para o painel administrativo.
✨ Funcionalidades Principais
Website Institucional Moderno e Responsivo: Design adaptado para visualização em desktops, tablets e smartphones.
Seções Detalhadas: "Sobre Mim", "Áreas de Atuação" com cards interativos (efeito collapse/acordeão) e "Contato".
Blog Dinâmico:
Artigos recentes exibidos na página inicial, carregados diretamente do banco de dados.
Página de visualização individual para cada artigo, acessada via slug na URL.
Painel de Administração Protegido (/admin.html):
Login seguro baseado em token de acesso.
Interface para gerenciamento completo de artigos (CRUD: Criar, Ler, Atualizar, Deletar).
Funcionalidade de upload de imagens para as capas dos artigos.
Opção de salvar artigos como "Rascunho" ou "Publicado".
Interatividade no Frontend: Uso do Alpine.js para criar componentes dinâmicos como os cards expansíveis e do AOS para animações de scroll.
Segurança:
Headers HTTP de segurança configurados com Helmet.js.
Política de Segurança de Conteúdo (CSP) para mitigar riscos de XSS.
Configuração de CORS para controlar acesso à API.
Limitação de taxa de requisições (Rate Limiting) para proteger a API contra abusos.
Logging: Sistema de logs para requisições HTTP e erros do servidor, facilitando o monitoramento e a depuração.
🛠️ Tecnologias Utilizadas
Frontend:
HTML5, CSS3, JavaScript (ES6+)
Tailwind CSS: Framework CSS utilitário para estilização rápida.
Alpine.js: Framework JavaScript minimalista para compor comportamentos interativos diretamente no HTML.
Inclui o plugin @alpinejs/collapse para animações de expandir/recolher.
AOS (Animate On Scroll): Biblioteca para animações ao rolar a página.
Font Awesome: Biblioteca de ícones.
Backend:
Node.js: Ambiente de execução JavaScript server-side.
Express.js: Framework web para Node.js, usado para construir a API.
Banco de Dados:
MongoDB: Banco de dados NoSQL orientado a documentos.
Mongoose: ODM (Object Data Modeling) para MongoDB, facilitando a interação com o banco.
Autenticação e Segurança (Backend):
JSON Web Tokens (JWT): Para proteger as rotas do painel administrativo (jsonwebtoken).
cookie-parser: Middleware para parse de cookies.
helmet: Middleware para configurar headers HTTP de segurança.
cors: Middleware para habilitar Cross-Origin Resource Sharing.
express-rate-limit: Middleware para limitar a taxa de requisições à API.
Upload de Arquivos:
multer: Middleware para manuseio de multipart/form-data (uploads de arquivos).
Ambiente e Ferramentas de Desenvolvimento:
dotenv: Módulo para carregar variáveis de ambiente de um arquivo .env.
morgan: Logger de requisições HTTP para o Express.
Docker: Plataforma de containerização (Dockerfile, docker-compose.yml).
Netlify: Configuração presente (netlify.toml), sugerindo uso para deploy (provavelmente do frontend estático).
⚙️ Pré-requisitos
Antes de executar o projeto, certifique-se de que os seguintes softwares estão instalados em sua máquina:

Node.js (versão 16.x ou mais recente é recomendada)
npm (geralmente instalado junto com o Node.js) ou Yarn
Uma instância do MongoDB (seja local, via Docker, ou um serviço na nuvem como MongoDB Atlas) configurada e acessível.
🚀 Configuração e Execução
Siga estes passos para configurar e rodar o projeto localmente:

1. Clonando o Repositório
Caso ainda não tenha o código, clone o repositório do GitHub (substitua pela URL correta, se aplicável):

Bash

git clone https://github.com/DevBielCastro/projetositegabrielmarioadv.git
cd projetositegabrielmarioadv
2. Instalando Dependências
Na pasta raiz do projeto, execute o comando para instalar todas as dependências listadas no package.json:

Bash

npm install
Ou, se estiver usando Yarn:

Bash

yarn install
3. Configurando Variáveis de Ambiente
Este projeto requer um arquivo .env na raiz para armazenar configurações importantes.

Crie uma cópia do arquivo .env.example (que serve como modelo) e nomeie-a como .env:

Bash

cp .env.example .env
(No Windows, use o comando copy .env.example .env)

Abra o arquivo .env e preencha as seguintes variáveis com os valores adequados para o seu ambiente:

PORT: A porta que o servidor Node.js utilizará (ex: 3000).
MONGODB_URI: Sua string de conexão completa para o banco de dados MongoDB.
Exemplo local: mongodb://localhost:27017/advdb_gabrielmario (substitua advdb_gabrielmario pelo nome do seu banco)
Exemplo MongoDB Atlas: mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.mongodb.net/advdb_gabrielmario?retryWrites=true&w=majority
ADMIN_TOKEN: Uma senha ou token secreto de sua escolha. Este valor será usado no campo "Token de Acesso" na página de login (/login.html) para acessar o painel de administração.
JWT_SECRET: Uma string secreta longa, complexa e única. É crucial para a segurança da assinatura dos JSON Web Tokens (JWTs) do painel.
JWT_EXPIRES_IN: Define o período de validade para os JWTs (ex: 1h, 24h, 7d).
LOG_LEVEL (Opcional): Pode ser definido como debug para ver mais detalhes em certos logs de erro.
Atenção: O arquivo .env contém informações confidenciais e não deve ser enviado para o repositório Git. Ele já está incluído no .gitignore.

4. Rodando a Aplicação Localmente
Após a instalação das dependências e a configuração do arquivo .env, inicie o servidor:

Bash

node server.js
Você deverá ver mensagens no console confirmando que o servidor foi iniciado e que a conexão com o MongoDB foi bem-sucedida.
Acesse o website em http://localhost:PORTA_CONFIGURADA (ex: http://localhost:3000, conforme sua configuração de porta).

🐳 Rodando com Docker (Opcional)
O projeto está preparado para ser executado em containers Docker usando os arquivos Dockerfile e docker-compose.yml.

Certifique-se de que o Docker e o Docker Compose estão instalados e em execução.
Configure o arquivo .env na raiz do projeto como descrito acima.
Na raiz do projeto, execute:
Bash

docker-compose up --build -d
O -d executa os containers em modo detached (background). O script atualizar_docker.ps1 é um auxiliar para ambiente Windows PowerShell que facilita o rebuild da imagem e o reinício do container.
📁 Estrutura do Projeto
Uma visão simplificada da organização das pastas e arquivos mais importantes:

/
├── api/                  # Lógica da API (rotas, modelos, autenticação)
├── assets/               # Recursos estáticos do frontend (CSS, JS, imagens)
├── blog/                 # Template para visualização de posts individuais
├── data/                 # (Potencialmente para volume de dados do MongoDB em Docker)
├── logs/                 # Arquivos de log do servidor
├── middleware/           # Middlewares Express customizados (ex: autenticação de rotas)
├── uploads/              # Destino para imagens carregadas via painel admin
├── .env                  # Suas variáveis de ambiente locais (NÃO VERSIONAR)
├── .env.example          # Exemplo/template para o arquivo .env
├── admin.html            # Interface do painel administrativo
├── index.html            # Página principal do site
├── login.html            # Página de login do painel
├── server.js             # Ponto de entrada e configuração do servidor Node.js/Express
├── database.js           # Script de conexão com o MongoDB
├── Dockerfile            # Configuração para build da imagem Docker
├── docker-compose.yml    # Configuração para orquestração de containers com Docker Compose
├── netlify.toml          # Configuração para deploy na plataforma Netlify
├── package.json          # Metadados do projeto e lista de dependências Node.js
└── README.md             # Este arquivo
🤝 Contribuições
Feedback, sugestões de melhorias e contribuições para o código são bem-vindos. Sinta-se à vontade para abrir uma Issue para discutir ideias ou reportar problemas, ou um Pull Request com suas implementações.

📜 Licença
Este projeto é distribuído sob a Licença ISC. Consulte o arquivo package.json para mais detalhes.


Espero que este `README.md` esteja completo e ajude a documentar bem o seu projeto!

Fontes