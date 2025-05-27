// assets/js/admin.js
// Script principal para a lógica do painel administrativo de posts.

// --- Configurações e Variáveis Globais ---
const ENDPOINT_BASE_API = '/api';
let tokenAutenticacao = localStorage.getItem('authToken');
let postsCarregadosGlobalmente = []; // Armazena os posts buscados da API para uso local.
let idPostEmEdicao = null; // ID do post atual em edição; null se for um novo post.

// Mapeamento dos elementos do DOM para acesso facilitado.
const DOMElements = {
  listaPostsContainer: document.getElementById('postsList'),
  modalEdicaoPost: document.getElementById('editModal'),
  formularioPost: document.getElementById('postForm'),
  campoTituloPost: document.getElementById('postTitle'),
  campoResumoPost: document.getElementById('postExcerpt'),
  campoConteudoPost: document.getElementById('postContent'),
  campoCategoriaPost: document.getElementById('postCategory'),
  campoUploadImagem: document.getElementById('imageUpload'),
  elementoPreviaThumbnail: document.getElementById('thumbPreview'),
  campoStatusPost: document.getElementById('postStatus'),
  botaoCancelarEdicao: document.getElementById('cancelarEdicao'),
  botaoNovoPost: document.getElementById('btnNovoPost'),
  botaoSalvarRascunho: document.getElementById('salvar-artigo'), // Presumindo que este é o botão submit do formulário.
  botaoEnviarPost: document.getElementById('enviar-post'),     // Botão para publicação/atualização final.
  botaoLogoutAdmin: document.getElementById('botaoLogout')
};

// --- Funções Principais ---

/**
 * Verifica se o token de autenticação JWT existe no localStorage.
 * Redireciona para a página de login se não houver token.
 */
function verificarAutenticacaoSessao() {
  if (!tokenAutenticacao) {
    alert('Sessão inválida ou expirada. Por favor, faça login novamente.');
    window.location.href = '/login.html';
  }
}

/**
 * Configura todos os ouvintes de eventos para os botões e formulários da página.
 */
function configurarOuvintesDeEventosGlobais() {
  if (DOMElements.botaoNovoPost) {
    DOMElements.botaoNovoPost.addEventListener('click', () => {
      limparFormularioEContextoDeEdicao();
      DOMElements.modalEdicaoPost.classList.remove('hidden');
      DOMElements.campoTituloPost.focus();
    });
  }

  if (DOMElements.botaoCancelarEdicao) {
    DOMElements.botaoCancelarEdicao.addEventListener('click', () => {
      DOMElements.modalEdicaoPost.classList.add('hidden');
      limparFormularioEContextoDeEdicao();
    });
  }

  if (DOMElements.botaoLogoutAdmin) {
    DOMElements.botaoLogoutAdmin.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = '/'; // Redireciona para a página inicial.
    });
  }

  if (DOMElements.campoUploadImagem) {
    DOMElements.campoUploadImagem.addEventListener('change', exibirPreviaDaImagemSelecionada);
  }

  // O formulário é submetido pelo botão "Salvar Rascunho" (type="submit").
  if (DOMElements.formularioPost) {
    DOMElements.formularioPost.addEventListener('submit', async (evento) => {
      evento.preventDefault(); // Impede a submissão padrão do HTML.
      await submeterFormularioPost(true); // 'true' indica que é para salvar como rascunho.
    });
  }

  // O botão "Enviar Post" tem seu próprio ouvinte de clique.
  if (DOMElements.botaoEnviarPost) {
    DOMElements.botaoEnviarPost.addEventListener('click', async () => {
      await submeterFormularioPost(false); // 'false' indica para usar o status do formulário (geralmente 'published').
    });
  }
}

/**
 * Exibe a imagem selecionada no input de upload como uma prévia no elemento <img>.
 * @param {Event} evento - O evento 'change' do input de arquivo.
 */
function exibirPreviaDaImagemSelecionada(evento) {
  const arquivo = evento.target.files[0];
  if (arquivo) {
    const leitor = new FileReader();
    leitor.onload = (e) => {
      DOMElements.elementoPreviaThumbnail.src = e.target.result;
      DOMElements.elementoPreviaThumbnail.classList.remove('hidden');
    };
    leitor.readAsDataURL(arquivo); // Converte o arquivo para base64 para o src da imagem.
  } else {
    // Se o usuário desmarcar o arquivo, e não estiver editando um post que já tinha imagem, limpa a prévia.
    if (!idPostEmEdicao || !DOMElements.elementoPreviaThumbnail.dataset.imagemOriginalUrl) {
      DOMElements.elementoPreviaThumbnail.src = '';
      DOMElements.elementoPreviaThumbnail.classList.add('hidden');
    } else {
      // Restaura a imagem original do post que estava sendo editado.
      DOMElements.elementoPreviaThumbnail.src = DOMElements.elementoPreviaThumbnail.dataset.imagemOriginalUrl;
    }
  }
}

/**
 * Busca os posts da API (rota protegida /api/posts/admin) e os renderiza na página.
 */
async function carregarPostsDoServidor() {
  verificarAutenticacaoSessao();
  if (!DOMElements.listaPostsContainer) return;

  DOMElements.listaPostsContainer.innerHTML = '<p>Carregando artigos...</p>';

  try {
    const resposta = await fetch(`${ENDPOINT_BASE_API}/posts/admin`, { // Busca da rota de admin.
      headers: {
        'Authorization': `Bearer ${tokenAutenticacao}`,
        'Content-Type': 'application/json'
      }
    });

    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error('Não autorizado ou sessão expirada. Faça login novamente.');
    }
    if (!resposta.ok) {
      const erroData = await resposta.json().catch(() => ({}));
      throw new Error(erroData.erro || `Falha ao carregar posts: ${resposta.status}`);
    }

    const dados = await resposta.json();
    postsCarregadosGlobalmente = dados.posts; // Armazena os posts para uso local.
    renderizarListaDePosts();
  } catch (erro) {
    console.error('Erro detalhado ao carregar posts:', erro);
    DOMElements.listaPostsContainer.innerHTML = `<p class="text-red-500">Erro ao carregar artigos: ${erro.message}</p>`;
    if (erro.message.includes('Não autorizado')) {
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }
  }
}

/**
 * Renderiza os posts carregados na lista da página.
 * Cada post terá botões para editar e excluir.
 */
function renderizarListaDePosts() {
  if (!DOMElements.listaPostsContainer) return;
  DOMElements.listaPostsContainer.innerHTML = '';

  if (!postsCarregadosGlobalmente || postsCarregadosGlobalmente.length === 0) {
    DOMElements.listaPostsContainer.innerHTML = '<p>Nenhum artigo cadastrado.</p>';
    return;
  }

  postsCarregadosGlobalmente.forEach(post => {
    const dataCriacao = new Date(post.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const classeStatus = post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
    const textoStatus = post.status === 'published' ? 'Publicado' : 'Rascunho';

    const htmlDoCard = `
      <div class="bg-white rounded-lg shadow-md p-4 mb-4 transition-all hover:shadow-lg">
        <div class="flex flex-col md:flex-row justify-between items-start">
          <div class="flex-grow mb-3 md:mb-0 md:mr-4">
            <h3 class="text-lg font-semibold text-gray-800">${post.title}</h3>
            <p class="text-xs text-gray-500 mt-1">
              <span>Categoria: ${post.category}</span> | <span>${dataCriacao}</span>
            </p>
            <p class="text-sm text-gray-600 mt-2 line-clamp-2">${post.excerpt || 'Sem resumo.'}</p>
          </div>
          <div class="flex items-center space-x-2 flex-shrink-0 w-full md:w-auto justify-end">
            <span class="text-xs font-medium px-2 py-0.5 rounded-full ${classeStatus}">${textoStatus}</span>
            <button onclick="prepararEdicaoPost('${post._id}')" title="Editar Post" class="text-blue-500 hover:text-blue-700 p-1">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button onclick="confirmarExclusaoPost('${post._id}')" title="Excluir Post" class="text-red-500 hover:text-red-700 p-1">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        ${post.thumbnail ? `<img src="${post.thumbnail}" alt="Miniatura de ${post.title}" class="mt-3 rounded w-full max-h-32 object-cover"/>` : ''}
      </div>
    `;
    DOMElements.listaPostsContainer.insertAdjacentHTML('beforeend', htmlDoCard);
  });
}

/**
 * Prepara o formulário do modal para editar um post existente.
 * @param {string} postId - O ID do post a ser editado.
 */
function prepararEdicaoPost(postId) {
  const post = postsCarregadosGlobalmente.find(p => p._id === postId);
  if (!post) {
    alert('Post não encontrado para edição.');
    return;
  }

  limparFormularioEContextoDeEdicao();
  idPostEmEdicao = postId; // Define que estamos editando.

  DOMElements.campoTituloPost.value = post.title;
  DOMElements.campoResumoPost.value = post.excerpt;
  DOMElements.campoConteudoPost.value = post.content || '';
  DOMElements.campoCategoriaPost.value = post.category;
  DOMElements.campoStatusPost.value = post.status || 'draft';

  if (post.thumbnail) {
    DOMElements.elementoPreviaThumbnail.src = post.thumbnail;
    DOMElements.elementoPreviaThumbnail.dataset.imagemOriginalUrl = post.thumbnail; // Guarda URL original.
    DOMElements.elementoPreviaThumbnail.classList.remove('hidden');
  } else {
     DOMElements.elementoPreviaThumbnail.classList.add('hidden');
     DOMElements.elementoPreviaThumbnail.removeAttribute('data-imagem-original-url');
  }
  DOMElements.campoUploadImagem.value = ''; // Limpa o campo de arquivo.

  DOMElements.modalEdicaoPost.classList.remove('hidden');
  DOMElements.campoTituloPost.focus();
}

/**
 * Função principal para criar ou atualizar um post, enviando dados para a API.
 * Utiliza FormData para permitir o upload de imagem.
 * @param {boolean} salvarComoRascunho - Se true, o status do post será 'draft', ignorando o seletor.
 */
async function submeterFormularioPost(salvarComoRascunho) {
  verificarAutenticacaoSessao();

  const { campoTituloPost, campoResumoPost, campoConteudoPost, campoCategoriaPost, campoStatusPost, campoUploadImagem } = DOMElements;

  if (!campoTituloPost.value.trim() || !campoConteudoPost.value.trim() || !campoResumoPost.value.trim() || !campoCategoriaPost.value.trim()) {
    alert('Preencha todos os campos obrigatórios: Título, Resumo, Conteúdo e Categoria.');
    return;
  }

  const dadosFormulario = new FormData();
  dadosFormulario.append('title', campoTituloPost.value.trim());
  dadosFormulario.append('excerpt', campoResumoPost.value.trim());
  dadosFormulario.append('content', campoConteudoPost.value.trim());
  dadosFormulario.append('category', campoCategoriaPost.value.trim());
  dadosFormulario.append('status', salvarComoRascunho ? 'draft' : campoStatusPost.value);

  const arquivoDeImagem = campoUploadImagem.files[0];
  if (arquivoDeImagem) {
    dadosFormulario.append('image', arquivoDeImagem); // Adiciona a imagem apenas se um novo arquivo foi selecionado.
  }
  // Se for uma edição (idPostEmEdicao existe) e nenhuma nova imagem foi selecionada,
  // não adicionamos 'image' ao FormData. O backend (api/posts.js) não alterará
  // o thumbnail se 'req.file' não estiver presente na atualização.

  const metodoHTTP = idPostEmEdicao ? 'PUT' : 'POST';
  const urlAPI = idPostEmEdicao
    ? `${ENDPOINT_BASE_API}/posts/${idPostEmEdicao}`
    : `${ENDPOINT_BASE_API}/posts`;

  // Feedback visual e desabilitar botões
  DOMElements.botaoSalvarRascunho.disabled = true;
  DOMElements.botaoEnviarPost.disabled = true;
  const textoBotaoOriginal = DOMElements.botaoEnviarPost.textContent;
  DOMElements.botaoEnviarPost.textContent = idPostEmEdicao ? 'Atualizando...' : 'Enviando...';

  try {
    const resposta = await fetch(urlAPI, {
      method: metodoHTTP,
      headers: {
        'Authorization': `Bearer ${tokenAutenticacao}`,
        // Content-Type não é definido manualmente ao usar FormData; o navegador o faz.
      },
      body: dadosFormulario,
    });

    if (!resposta.ok) {
      const erroData = await resposta.json().catch(() => ({ erro: `Erro HTTP ${resposta.status}` }));
      throw new Error(erroData.erro || `Falha ao salvar o post.`);
    }

    // const postSalvo = await resposta.json(); // Dados do post retornado pela API.

    alert(`Post ${salvarComoRascunho ? 'salvo como rascunho' : (idPostEmEdicao ? 'atualizado' : 'publicado')} com sucesso!`);
    DOMElements.modalEdicaoPost.classList.add('hidden');
    limparFormularioEContextoDeEdicao();
    await carregarPostsDoServidor(); // Recarrega a lista para refletir as mudanças.

  } catch (erro) {
    console.error('Erro ao submeter post:', erro);
    alert(`Erro: ${erro.message}`);
  } finally {
    DOMElements.botaoSalvarRascunho.disabled = false;
    DOMElements.botaoEnviarPost.disabled = false;
    DOMElements.botaoEnviarPost.textContent = textoBotaoOriginal;
  }
}

/**
 * Solicita confirmação e, se confirmado, envia requisição para excluir um post.
 * @param {string} postId - O ID do post a ser excluído.
 */
async function confirmarExclusaoPost(postId) {
  verificarAutenticacaoSessao();
  if (!confirm('Tem certeza que deseja excluir este post permanentemente?')) {
    return;
  }

  try {
    const resposta = await fetch(`${ENDPOINT_BASE_API}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenAutenticacao}`,
      }
    });

    if (!resposta.ok) {
      const erroData = await resposta.json().catch(() => ({}));
      throw new Error(erroData.erro || `Falha ao excluir post: ${resposta.status}`);
    }

    alert('Post excluído com sucesso.');
    await carregarPostsDoServidor(); // Recarrega a lista.
  } catch (erro) {
    console.error('Erro ao excluir post:', erro);
    alert(`Erro ao excluir: ${erro.message}`);
  }
}

/**
 * Limpa os campos do formulário, a prévia da imagem e o estado de edição.
 */
function limparFormularioEContextoDeEdicao() {
  idPostEmEdicao = null;
  if (DOMElements.formularioPost) DOMElements.formularioPost.reset();
  if (DOMElements.elementoPreviaThumbnail) {
    DOMElements.elementoPreviaThumbnail.src = '';
    DOMElements.elementoPreviaThumbnail.classList.add('hidden');
    DOMElements.elementoPreviaThumbnail.removeAttribute('data-imagem-original-url');
  }
  if (DOMElements.campoUploadImagem) DOMElements.campoUploadImagem.value = '';

  // Garante que os botões de submissão estejam habilitados
  if(DOMElements.botaoSalvarRascunho) DOMElements.botaoSalvarRascunho.disabled = false;
  if(DOMElements.botaoEnviarPost) {
    DOMElements.botaoEnviarPost.disabled = false;
    DOMElements.botaoEnviarPost.textContent = 'Enviar Post';
  }
}

// --- Inicialização do Script ---
// Adiciona um ouvinte para executar o código quando o DOM estiver totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacaoSessao();
  configurarOuvintesDeEventosGlobais();
  carregarPostsDoServidor();
});

// Para que as funções chamadas por `onclick` no HTML funcionem, elas precisam estar no escopo global.
// Uma abordagem mais moderna seria adicionar todos os event listeners dinamicamente em configurarOuvintesDeEventosGlobais.
window.prepararEdicaoPost = prepararEdicaoPost;
window.confirmarExclusaoPost = confirmarExclusaoPost;