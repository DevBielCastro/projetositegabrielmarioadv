"Gabriel Mário Advocacia"
&lt;div align="center">
&lt;h1>Website e Painel Administrativo - Gabriel Mário Advocacia&lt;/h1>
&lt;/div>

&lt;p align="center">
&lt;em>Website institucional moderno e dinâmico para o Dr. Gabriel Mário, advogado com atuação em Direito Estratégico. Inclui um blog jurídico e um painel administrativo para gerenciamento de conteúdo.&lt;/em>
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
Este projeto consiste em um website institucional completo para o Dr. Gabriel Mário, focado em apresentar seus serviços jurídicos, sua experiência profissional e um blog para publicação de artigos. Adicionalmente, conta com um painel administrativo para que o Dr. Gabriel possa gerenciar o conteúdo do blog de forma autônoma.

O frontend é construído com HTML, CSS (Tailwind CSS e estilos customizados) e JavaScript (Vanilla JS e Alpine.js para interatividade). O backend é uma API RESTful desenvolvida em Node.js com Express.js, utilizando MongoDB como banco de dados para persistência dos artigos e informações.

✨ Funcionalidades Principais
Website Público Responsivo: Interface moderna e adaptável a diversos dispositivos (desktops, tablets, celulares).
Seções Informativas Detalhadas:
"Sobre Mim": Apresentação do perfil profissional do Dr. Gabriel Mário.
"Áreas de Atuação": Descrição interativa dos serviços oferecidos (com cards expansíveis).
Blog Dinâmico:
Listagem de artigos recentes na página inicial.
Página individual para leitura completa de cada artigo.
Conteúdo dos artigos carregado dinamicamente do banco de dados.
Painel de Administração Protegido:
Acesso restrito via token (/login.html, /admin.html).
Gerenciamento completo (CRUD) de posts do blog.
Upload de imagens de capa para os artigos.
Segurança Aplicada:
Headers de segurança HTTP via Helmet.js.
Configuração de CORS para permitir origens específicas.
Limitação de taxa de requisições (Rate Limiting) para a API.
Logging: Registros de acesso e erros do servidor para monitoramento e depuração.
🛠️ Tecnologias Utilizadas
Frontend:
HTML5
CSS3
Tailwind CSS
JavaScript (Vanilla JS)
Alpine.js (para interatividade)
AOS (Animate On Scroll)
Font Awesome (para ícones)
Backend:
Node.js
Express.js
Banco de Dados:
MongoDB
Mongoose (ODM)
Autenticação & Segurança (Backend):
JSON Web Tokens (JWT) com jsonwebtoken
cookie-parser
Helmet.js, CORS, express-rate-limit
Upload de Arquivos:
Multer
Ambiente e Ferramentas:
dotenv (para variáveis de ambiente)
morgan (logger HTTP)
Docker (Dockerfile, docker-compose.yml)
Netlify (sugerido pelo netlify.toml)
⚙️ Pré-requisitos
Antes de iniciar, certifique-se de ter os seguintes softwares instalados em sua máquina:

Node.js (versão 16.x ou superior é recomendada)
npm (geralmente instalado com o Node.js) ou Yarn
Uma instância do MongoDB acessível (pode ser local, via Docker, ou um serviço em nuvem como o MongoDB Atlas)
🚀 Configuração e Execução
Siga os passos abaixo para configurar e executar o projeto em seu ambiente local:

1. Clonando o Repositório
Se você ainda não tem o projeto, clone-o do GitHub (substitua pela URL correta do seu repositório):

Bash

git clone https://github.com/DevBielCastro/projetositegabrielmarioadv.git
cd projetositegabrielmarioadv
2. Instalando Dependências
Navegue até a pasta raiz do projeto e instale as dependências do Node.js:

Bash

npm install
ou, se preferir usar o Yarn:

Bash

yarn install
3. Configurando Variáveis de Ambiente
O projeto utiliza um arquivo .env para gerenciar configurações sensíveis e específicas do ambiente.

Na raiz do projeto, crie uma cópia do arquivo .env.example e nomeie-a como .env.

Bash

cp .env.example .env
(No Windows, você pode usar copy .env.example .env)

Abra o arquivo .env recém-criado e edite as seguintes variáveis com seus próprios valores:

PORT: A porta em que o servidor Node.js será executado (ex: 3000).
MONGODB_URI: A string de conexão completa para o seu banco de dados MongoDB.
Exemplo para MongoDB local: mongodb://localhost:27017/advdb
Exemplo para MongoDB Atlas: mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.mongodb.net/advdb?retryWrites=true&w=majority
ADMIN_TOKEN: Um token/senha secreta de sua escolha. Este token será usado no campo "Token de Acesso" da página de login (/login.html) para acessar o painel administrativo.
JWT_SECRET: Uma string secreta longa, complexa e aleatória. É usada para assinar os JSON Web Tokens (JWTs) gerados após o login bem-sucedido no painel admin. Mantenha isso em segredo!
JWT_EXPIRES_IN: Define o tempo de validade dos JWTs (ex: 1h para uma hora, 7d para sete dias).
LOG_LEVEL (Opcional): Controla o nível de detalhamento de alguns logs (ex: debug para mais detalhes, ou info).
Importante: O arquivo .env contém informações sensíveis e não deve ser versionado (incluído no Git). O arquivo .gitignore já deve estar configurado para ignorá-lo.

4. Rodando a Aplicação Localmente
Com as dependências instaladas e o arquivo .env configurado, inicie o servidor Node.js:

Bash

node server.js
Você deverá ver mensagens no console indicando que o servidor foi iniciado e conectado ao MongoDB.
Acesse o site no seu navegador através de http://localhost:PORTA_CONFIGURADA (ex: http://localhost:3000 se a porta for 3000).

🐳 Rodando com Docker (Opcional)
Se você prefere usar Docker para executar o projeto:

Certifique-se de que o Docker e o Docker Compose estejam instalados e rodando em sua máquina.
Configure o arquivo .env na raiz do projeto conforme descrito na seção anterior, pois o Docker Compose o utilizará.
Na raiz do projeto, execute o seguinte comando para construir a imagem e iniciar os containers:
Bash

docker-compose up --build
Isso utilizará os arquivos Dockerfile e docker-compose.yml presentes no projeto. O script atualizar_docker.ps1 é um utilitário para usuários de Windows PowerShell que automatiza o rebuild da imagem e o reinício do container.
📁 Estrutura do Projeto
Uma visão geral da organização das pastas e arquivos principais:

projetositegabrielmarioadv/
├── api/                      # Contém toda a lógica da API backend
│   ├── models/               # Definições de schemas do Mongoose (ex: post.js)
│   ├── auth.js               # Lógica de autenticação para o painel admin
│   └── posts.js              # Rotas e lógica para o CRUD de artigos
├── assets/                   # Recursos estáticos do frontend
│   ├── css/                  # Arquivos CSS (ex: main.css)
│   ├── img/                  # Imagens do site (logos, fotos, etc.)
│   └── js/                   # Arquivos JavaScript do frontend (ex: admin.js, main.js)
├── blog/                     # Template HTML para a página de um post individual
├── data/                     # (Possivelmente para dados de um MongoDB local via Docker volume)
├── logs/                     # Arquivos de log gerados pelo servidor
├── middleware/               # (Pasta para middlewares customizados do Express, como o de autenticação)
├── node_modules/             # Dependências do projeto (instaladas via npm/yarn)
├── uploads/                  # Pasta onde as imagens dos posts são salvas
├── .env                      # Arquivo COM AS SUAS variáveis de ambiente (NÃO versionar!)
├── .env.example              # Arquivo de exemplo para as variáveis de ambiente
├── .gitignore                # Especifica arquivos e pastas a serem ignorados pelo Git
├── admin.html                # Página do painel administrativo
├── database.js               # Script de conexão com o MongoDB
├── Dockerfile                # Instruções para construir a imagem Docker da aplicação
├── docker-compose.yml        # Define os serviços para rodar com Docker Compose
├── index.html                # Página inicial do website
├── login.html                # Página de login para o painel administrativo
├── netlify.toml              # Arquivo de configuração para deploy no Netlify
├── package-lock.json         # Lockfile gerado pelo npm
├── package.json              # Metadados do projeto, scripts e dependências
├── server.js                 # Arquivo principal de inicialização do servidor Node.js/Express
└── README.md                 # Este arquivo de documentação
🤝 Contribuições
Se desejar contribuir com o projeto, por favor, siga as diretrizes de contribuição (se houver) ou entre em contato. Pull requests são bem-vindos!

📜 Licença
Este projeto é distribuído sob a Licença ISC. Veja o arquivo LICENSE (se existir) ou o package.json para mais detalhes.


---

Espero que este `README.md` seja útil e completo para o seu projeto! Avise se precisar de mais algum ajuste ou seção.

Fontes