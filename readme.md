&lt;div align="center">
&lt;h1>Website e Painel Administrativo - Gabriel Mário Advocacia&lt;/h1>
&lt;/div>

&lt;p align="center">
&lt;em>Website institucional moderno, dinâmico e interativo para o Dr. Gabriel Mário, advogado com atuação em Direito Estratégico. O projeto inclui um blog jurídico com conteúdo gerenciável através de um painel administrativo dedicado.&lt;/em>
&lt;/p>
&lt;p align="center">
Acesse o site (se estiver no ar): &lt;a href="[link suspeito removido]" target="_blank">gabrielmarioadv.com.br&lt;/a>
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
📝 Visão Geral do Projeto
✨ Funcionalidades Principais
🛠️ Tecnologias Utilizadas
⚙️ Pré-requisitos
🚀 Configuração e Execução
1. Clonando o Repositório
2. Instalando Dependências
3. Configurando Variáveis de Ambiente
4. Rodando a Aplicação Localmente
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
Gerenciamento de Categorias para os artigos (CRUD).
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
Alpine.js: Framework JavaScript minimalista para compor comportamentos interativos diretamente no HTML (incluindo o plugin @alpinejs/collapse).
AOS (Animate On Scroll): Biblioteca para animações ao rolar a página.
Font Awesome: Biblioteca de ícones.
Backend:
Node.js: Ambiente de execução JavaScript server-side.
Express.js: Framework web para Node.js.
Banco de Dados:
MongoDB: Banco de dados NoSQL orientado a documentos.
Mongoose: ODM (Object Data Modeling) para MongoDB.
Autenticação e Segurança (Backend):
JSON Web Tokens (JWT) com jsonwebtoken.
cookie-parser.
Helmet.js, CORS, express-rate-limit.
Upload de Arquivos:
multer.
Ambiente e Ferramentas de Desenvolvimento:
dotenv (para variáveis de ambiente).
morgan (logger HTTP).
Docker (Dockerfile, docker-compose.yml).
Netlify (configuração em netlify.toml).
⚙️ Pré-requisitos
Antes de executar o projeto, certifique-se de que os seguintes softwares estão instalados em sua máquina:

Node.js (versão 16.x ou mais recente é recomendada)
npm (geralmente instalado junto com o Node.js) ou Yarn
Uma instância do MongoDB (seja local, via Docker, ou um serviço na nuvem como MongoDB Atlas) configurada e acessível.
🚀 Configuração e Execução
Siga estes passos para configurar e rodar o projeto localmente:

1. Clonando o Repositório
Bash

git clone https://github.com/DevBielCastro/projetositegabrielmarioadv.git
cd projetositegabrielmarioadv
2. Instalando Dependências
Na pasta raiz do projeto, execute:

Bash

npm install
Ou, se estiver usando Yarn:

Bash

yarn install
3. Configurando Variáveis de Ambiente
Este projeto requer um arquivo .env na raiz para armazenar configurações importantes.

Crie uma cópia do arquivo .env.example e nomeie-a como .env:

Bash

cp .env.example .env
(No Windows, use o comando copy .env.example .env)

Abra o arquivo .env e preencha as seguintes variáveis com os valores adequados para o seu ambiente:

PORT: Porta do servidor (ex: 3000).
MONGODB_URI: String de conexão completa para o banco de dados MongoDB.
Exemplo local: mongodb://localhost:27017/advdb_gabrielmario
Exemplo MongoDB Atlas: mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.mongodb.net/advdb_gabrielmario?retryWrites=true&w=majority
ADMIN_TOKEN: Senha ou token secreto para acessar o painel administrativo (/login.html).
JWT_SECRET: String secreta longa e única para assinar os JSON Web Tokens (JWTs).
JWT_EXPIRES_IN: Tempo de validade dos JWTs (ex: 1h, 7d).
CORS_ORIGIN: Para produção, defina como https://gabrielmarioadv.com.br e http://localhost:3000 para desenvolvimento.
Outras variáveis conforme o .env.example.
Atenção: O arquivo .env contém informações confidenciais e não deve ser enviado para o repositório Git. Ele já está incluído no .gitignore.

4. Rodando a Aplicação Localmente
Após instalar as dependências e configurar o .env, inicie o servidor:

Bash

node server.js
Acesse o website em http://localhost:PORTA_CONFIGURADA (ex: http://localhost:3000).

🐳 Rodando com Docker (Opcional)
O projeto está preparado para ser executado em containers Docker.

Certifique-se de que Docker e Docker Compose estão instalados.
Configure o arquivo .env.
Na raiz do projeto, execute:
Bash

docker-compose up --build -d
O script atualizar_docker.ps1 é um auxiliar para ambiente Windows PowerShell.
📁 Estrutura do Projeto
Uma visão simplificada da organização das pastas e arquivos:

/
├── api/
│   ├── models/ (category.js, post.js)
│   ├── routes/ (categories.js)
│   ├── auth.js
│   └── posts.js
├── assets/ (css/, img/, js/)
├── blog/ (post.html)
├── logs/
├── middleware/ (auth.js)
├── uploads/
├── .env (NÃO VERSIONAR)
├── .env.example
├── admin.html, index.html, login.html, 404.html
├── database.js, server.js
├── Dockerfile, docker-compose.yml, netlify.toml
├── package.json, README.md
└── ... (outros arquivos e pastas como .gitkeep, .dockerignore)
🤝 Contribuições
Feedback, sugestões de melhorias e contribuições para o código são bem-vindos. Sinta-se à vontade para abrir uma Issue para discutir ideias ou reportar problemas, ou um Pull Request com suas implementações.

📜 Licença
Este projeto é distribuído sob a Licença ISC. Consulte o arquivo package.json para mais detalhes.