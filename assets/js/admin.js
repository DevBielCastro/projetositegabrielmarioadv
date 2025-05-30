// assets/js/admin.js
// Script principal para a lógica do painel administrativo de posts e categorias.

// --- Configurações e Variáveis Globais ---
const ENDPOINT_BASE_API = '/api';
let tokenAutenticacao = localStorage.getItem('authToken');
let postsCarregadosGlobalmente = [];
let idPostEmEdicao = null;
let categoriasCarregadas = []; // Para armazenar categorias carregadas da API

// Mapeamento dos elementos do DOM para acesso facilitado.
const DOMElements = {
  listaPostsContainer: document.getElementById('postsList'),
  modalEdicaoPost: document.getElementById('editModal'),
  formularioPost: document.getElementById('postForm'),
  campoTituloPost: document.getElementById('postTitle'),
  campoResumoPost: document.getElementById('postExcerpt'),
  campoConteudoPost: document.getElementById('postContent'),
  campoCategoriaPost: document.getElementById('postCategory'), // Select de categorias no modal de posts
  campoUploadImagem: document.getElementById('imageUpload'),
  elementoPreviaThumbnail: document.getElementById('thumbPreview'),
  campoStatusPost: document.getElementById('postStatus'),
  // IDs ATUALIZADOS conforme seu último admin.html:
  botaoCancelarEdicaoArtigo: document.getElementById('cancelarEdicaoArtigo'),
  botaoNovoPost: document.getElementById('btnNovoPost'),
  botaoSalvarRascunho: document.getElementById('salvar-artigo'),
  botaoEnviarPost: document.getElementById('enviar-post'),
  botaoLogoutAdmin: document.getElementById('botaoLogout'),
  botaoFecharModalArtigo: document.getElementById('fecharModalArtigo'),

  // Novos elementos para o Modal de Categorias (conforme seu último admin.html)
  btnAbrirModalCategorias: document.getElementById('btnAbrirModalCategorias'),
  modalCategorias: document.getElementById('categoryModal'),
  inputNomeNovaCategoria: document.getElementById('inputNomeNovaCategoria'),
  formNovaCategoria: document.getElementById('novaCategoriaForm'),
  btnSalvarNovaCategoria: document.getElementById('btnSalvarNovaCategoria'),
  containerListaCategorias: document.getElementById('containerListaCategorias'),
  btnFecharModalCategoria: document.getElementById('fecharModalCategoria'),
  btnConcluirModalCategoria: document.getElementById('btnConcluirModalCategoria')
};

// --- Funções de Autenticação e Utilitárias ---
function verificarAutenticacaoSessao() {
  if (!tokenAutenticacao) {
    alert('Sessão inválida ou expirada. Por favor, faça login novamente.');
    window.location.href = '/login.html';
  }
}

function limparFormularioEContextoDeEdicao() {
  idPostEmEdicao = null;
  if (DOMElements.formularioPost) DOMElements.formularioPost.reset();
  if (DOMElements.elementoPreviaThumbnail) {
    DOMElements.elementoPreviaThumbnail.src = '';
    DOMElements.elementoPreviaThumbnail.classList.add('hidden');
    DOMElements.elementoPreviaThumbnail.removeAttribute('data-imagem-original-url');
  }
  if (DOMElements.campoUploadImagem) DOMElements.campoUploadImagem.value = '';

  if(DOMElements.botaoSalvarRascunho) DOMElements.botaoSalvarRascunho.disabled = false;
  if(DOMElements.botaoEnviarPost) {
    DOMElements.botaoEnviarPost.disabled = false;
    DOMElements.botaoEnviarPost.textContent = 'Publicar / Atualizar Artigo';
  }
  // Limpa e repopula o select de categorias com o placeholder e as categorias carregadas
  if (DOMElements.campoCategoriaPost) {
    popularDropdownCategorias(); // Garante que o dropdown esteja sempre atualizado ao abrir/limpar o modal
  }
}

function exibirPreviaDaImagemSelecionada(evento) {
  const arquivo = evento.target.files[0];
  const placeholderPrevia = document.getElementById('placeholderPreviaImagem'); // Pega o placeholder
  if (arquivo) {
    const leitor = new FileReader();
    leitor.onload = (e) => {
      DOMElements.elementoPreviaThumbnail.src = e.target.result;
      DOMElements.elementoPreviaThumbnail.classList.remove('hidden');
      if (placeholderPrevia) placeholderPrevia.classList.add('hidden'); // Esconde o placeholder
    };
    leitor.readAsDataURL(arquivo);
  } else {
    if (!idPostEmEdicao || !DOMElements.elementoPreviaThumbnail.dataset.imagemOriginalUrl) {
      DOMElements.elementoPreviaThumbnail.src = '';
      DOMElements.elementoPreviaThumbnail.classList.add('hidden');
      if (placeholderPrevia) placeholderPrevia.classList.remove('hidden'); // Mostra o placeholder
    } else {
      DOMElements.elementoPreviaThumbnail.src = DOMElements.elementoPreviaThumbnail.dataset.imagemOriginalUrl;
      if (placeholderPrevia) placeholderPrevia.classList.add('hidden');
    }
  }
}

// --- Lógica para Posts ---
async function carregarPostsDoServidor() {
  verificarAutenticacaoSessao();
  if (!DOMElements.listaPostsContainer) return;
  DOMElements.listaPostsContainer.innerHTML = '<p class="text-center col-span-full text-gray-600">Carregando artigos...</p>';

  try {
    const respostaPosts = await fetch(`${ENDPOINT_BASE_API}/posts/admin?timestamp=${new Date().getTime()}`, { // Adicionado timestamp para evitar cache
      headers: { 'Authorization': `Bearer ${tokenAutenticacao}` }
    });

    if (respostaPosts.status === 401 || respostaPosts.status === 403) {
      throw new Error('Não autorizado ou sessão expirada.');
    }
    if (!respostaPosts.ok) {
      const erroData = await respostaPosts.json().catch(() => ({}));
      throw new Error(erroData.erro || `Falha ao carregar posts: ${respostaPosts.status}`);
    }

    const dadosPosts = await respostaPosts.json();
    postsCarregadosGlobalmente = dadosPosts.posts || []; // Garante que seja um array
    renderizarListaDePosts(); // Esta função agora mostrará "Nenhum artigo..." se postsCarregadosGlobalmente for vazio

    await carregarCategoriasParaDropdown(); // Carrega categorias para o modal de posts

  } catch (erro) {
    console.error('Erro detalhado ao carregar posts:', erro);
    DOMElements.listaPostsContainer.innerHTML = `<p class="text-center col-span-full text-red-500">Erro ao carregar artigos: ${erro.message}</p>`;
    if (erro.message.includes('Não autorizado')) {
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }
  }
}

function renderizarListaDePosts() {
  if (!DOMElements.listaPostsContainer) return;
  DOMElements.listaPostsContainer.innerHTML = '';

  if (postsCarregadosGlobalmente.length === 0) {
    // CORREÇÃO: Garante que a mensagem apareça se não houver posts
    DOMElements.listaPostsContainer.innerHTML = '<p class="text-center col-span-full text-gray-500 py-8">Nenhum artigo cadastrado ainda.</p>';
    return;
  }

  postsCarregadosGlobalmente.forEach(post => {
    const dataCriacao = new Date(post.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const classeStatus = post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
    const textoStatus = post.status === 'published' ? 'Publicado' : 'Rascunho';

    const htmlDoCard = `
      <div class="bg-white rounded-lg shadow-md p-4 mb-4 transition-all hover:shadow-lg flex flex-col">
        <div class="flex-grow">
            ${post.thumbnail ? `<img src="${post.thumbnail}" alt="Miniatura de ${post.title}" class="mb-3 rounded w-full h-32 object-cover"/>` : '<div class="mb-3 rounded w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Sem Imagem</div>'}
            <h3 class="text-lg font-semibold text-gray-800 truncate" title="${post.title}">${post.title}</h3>
            <p class="text-xs text-gray-500 mt-1">
              <span>Cat: ${post.category}</span> | <span>${dataCriacao}</span>
            </p>
            <p class="text-sm text-gray-600 mt-2 line-clamp-2 h-10">${post.excerpt || 'Sem resumo.'}</p>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
          <span class="text-xs font-medium px-2 py-0.5 rounded-full ${classeStatus}">${textoStatus}</span>
          <div class="space-x-2">
            <button onclick="prepararEdicaoPost('${post._id}')" title="Editar Post" class="text-blue-500 hover:text-blue-700 p-1">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button onclick="confirmarExclusaoPost('${post._id}')" title="Excluir Post" class="text-red-500 hover:text-red-700 p-1">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    DOMElements.listaPostsContainer.insertAdjacentHTML('beforeend', htmlDoCard);
  });
}

function prepararEdicaoPost(postId) {
  const post = postsCarregadosGlobalmente.find(p => p._id === postId);
  if (!post) {
    alert('Post não encontrado para edição.');
    return;
  }
  limparFormularioEContextoDeEdicao();
  idPostEmEdicao = postId;

  DOMElements.campoTituloPost.value = post.title;
  DOMElements.campoResumoPost.value = post.excerpt;
  DOMElements.campoConteudoPost.value = post.content || '';
  // Pré-seleciona a categoria correta no dropdown
  if (DOMElements.campoCategoriaPost) {
      DOMElements.campoCategoriaPost.value = post.category;
      // Se a categoria do post não estiver no dropdown (caso raro), ele não será selecionado.
      // Poderia adicionar a categoria do post ao dropdown se ela não existir.
      if (DOMElements.campoCategoriaPost.value !== post.category) {
          console.warn(`Categoria "${post.category}" do post não encontrada no dropdown.`);
          // Adicionar a categoria se ela não existir nas opções carregadas
          let categoriaExiste = Array.from(DOMElements.campoCategoriaPost.options).some(opt => opt.value === post.category);
          if (!categoriaExiste) {
              const option = document.createElement('option');
              option.value = post.category;
              option.textContent = post.category;
              DOMElements.campoCategoriaPost.appendChild(option);
          }
          DOMElements.campoCategoriaPost.value = post.category;
      }
  }

  DOMElements.campoStatusPost.value = post.status || 'draft';

  const placeholderPrevia = document.getElementById('placeholderPreviaImagem');
  if (post.thumbnail) {
    DOMElements.elementoPreviaThumbnail.src = post.thumbnail;
    DOMElements.elementoPreviaThumbnail.dataset.imagemOriginalUrl = post.thumbnail;
    DOMElements.elementoPreviaThumbnail.classList.remove('hidden');
    if (placeholderPrevia) placeholderPrevia.classList.add('hidden');
  } else {
    DOMElements.elementoPreviaThumbnail.classList.add('hidden');
    DOMElements.elementoPreviaThumbnail.removeAttribute('data-imagem-original-url');
    if (placeholderPrevia) placeholderPrevia.classList.remove('hidden');
  }
  DOMElements.campoUploadImagem.value = '';

  DOMElements.modalEdicaoPost.classList.remove('hidden');
  DOMElements.campoTituloPost.focus();
}

async function submeterFormularioPost(salvarComoRascunho) {
  verificarAutenticacaoSessao();
  const { campoTituloPost, campoResumoPost, campoConteudoPost, campoCategoriaPost, campoStatusPost, campoUploadImagem } = DOMElements;

  if (!campoTituloPost.value.trim() || !campoConteudoPost.value.trim() || !campoResumoPost.value.trim() || !campoCategoriaPost.value) { // Categoria também é obrigatória
    alert('Preencha todos os campos obrigatórios: Título, Resumo, Conteúdo e Categoria.');
    return;
  }

  const dadosFormulario = new FormData();
  dadosFormulario.append('title', campoTituloPost.value.trim());
  dadosFormulario.append('excerpt', campoResumoPost.value.trim());
  dadosFormulario.append('content', campoConteudoPost.value.trim());
  dadosFormulario.append('category', campoCategoriaPost.value);
  dadosFormulario.append('status', salvarComoRascunho ? 'draft' : campoStatusPost.value);

  const arquivoDeImagem = campoUploadImagem.files[0];
  if (arquivoDeImagem) {
    dadosFormulario.append('image', arquivoDeImagem);
  }

  const metodoHTTP = idPostEmEdicao ? 'PUT' : 'POST';
  const urlAPI = idPostEmEdicao
    ? `${ENDPOINT_BASE_API}/posts/${idPostEmEdicao}`
    : `${ENDPOINT_BASE_API}/posts`;

  DOMElements.botaoSalvarRascunho.disabled = true;
  DOMElements.botaoEnviarPost.disabled = true;
  const textoBotaoOriginal = DOMElements.botaoEnviarPost.textContent;
  DOMElements.botaoEnviarPost.textContent = idPostEmEdicao ? 'Atualizando...' : 'Enviando...';

  try {
    const resposta = await fetch(urlAPI, {
      method: metodoHTTP,
      headers: { 'Authorization': `Bearer ${tokenAutenticacao}` },
      body: dadosFormulario,
    });

    if (!resposta.ok) {
      const erroData = await resposta.json().catch(() => ({ erro: `Erro HTTP ${resposta.status}` }));
      throw new Error(erroData.erro || `Falha ao salvar o post.`);
    }
    alert(`Post ${salvarComoRascunho ? 'salvo como rascunho' : (idPostEmEdicao ? 'atualizado' : 'publicado')} com sucesso!`);
    DOMElements.modalEdicaoPost.classList.add('hidden');
    limparFormularioEContextoDeEdicao();
    await carregarPostsDoServidor();
  } catch (erro) {
    console.error('Erro ao submeter post:', erro);
    alert(`Erro: ${erro.message}`);
  } finally {
    DOMElements.botaoSalvarRascunho.disabled = false;
    DOMElements.botaoEnviarPost.disabled = false;
    DOMElements.botaoEnviarPost.textContent = textoBotaoOriginal;
  }
}

async function confirmarExclusaoPost(postId) {
  verificarAutenticacaoSessao();
  if (!confirm('Tem certeza que deseja excluir este post permanentemente?')) return;

  try {
    const resposta = await fetch(`${ENDPOINT_BASE_API}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenAutenticacao}` }
    });
    if (!resposta.ok) {
      const erroData = await resposta.json().catch(() => ({}));
      throw new Error(erroData.erro || `Falha ao excluir post: ${resposta.status}`);
    }
    alert('Post excluído com sucesso.');
    await carregarPostsDoServidor();
  } catch (erro) {
    console.error('Erro ao excluir post:', erro);
    alert(`Erro ao excluir: ${erro.message}`);
  }
}


// --- LÓGICA PARA GERENCIAMENTO DE CATEGORIAS ---
async function carregarCategoriasParaDropdown() {
  if (!DOMElements.campoCategoriaPost) return;
  try {
    const resposta = await fetch(`${ENDPOINT_BASE_API}/categories?timestamp=${new Date().getTime()}`, { // Adicionado timestamp
      headers: { 'Authorization': `Bearer ${tokenAutenticacao}` }
    });
    if (!resposta.ok) {
      console.error('Erro HTTP ao buscar categorias para o dropdown:', resposta.status);
      DOMElements.campoCategoriaPost.innerHTML = '<option value="">Erro ao carregar</option>';
      return;
    }
    const dados = await resposta.json();
    categoriasCarregadas = dados.categories || []; // Supondo que a API retorna { categories: [...] }
    popularDropdownCategorias();
  } catch (erro) {
    console.error('Erro na requisição de categorias:', erro);
    DOMElements.campoCategoriaPost.innerHTML = '<option value="">Falha na conexão</option>';
  }
}

function popularDropdownCategorias() {
    if (!DOMElements.campoCategoriaPost) return;
    const valorSelecionadoAnteriormente = DOMElements.campoCategoriaPost.value; // Guarda o valor selecionado, se houver
    
    DOMElements.campoCategoriaPost.innerHTML = '<option value="" disabled>Selecione uma categoria</option>'; 

    if (categoriasCarregadas.length > 0) {
        categoriasCarregadas.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.nome; // Salva o nome da categoria como valor
            option.textContent = categoria.nome;
            DOMElements.campoCategoriaPost.appendChild(option);
        });
    } else {
        DOMElements.campoCategoriaPost.innerHTML = '<option value="" disabled selected>Nenhuma categoria cadastrada</option>';
    }
    // Tenta restaurar a seleção anterior, se aplicável (útil ao abrir modal para editar post)
    if (valorSelecionadoAnteriormente) {
        DOMElements.campoCategoriaPost.value = valorSelecionadoAnteriormente;
    }
     // Se após popular, nenhum valor estiver selecionado (ex: categoria do post não existe mais),
     // e se o dropdown não tiver a opção placeholder selecionada, seleciona o placeholder.
    if (!DOMElements.campoCategoriaPost.value && DOMElements.campoCategoriaPost.options.length > 0 && DOMElements.campoCategoriaPost.selectedIndex === -1) {
        DOMElements.campoCategoriaPost.options[0].selected = true;
    }
}

async function carregarEExibirCategoriasNoModal() {
  if (!DOMElements.containerListaCategorias) return;
  DOMElements.containerListaCategorias.innerHTML = '<p class="text-sm text-gray-500">Carregando categorias...</p>';
  try {
    const resposta = await fetch(`${ENDPOINT_BASE_API}/categories?timestamp=${new Date().getTime()}`, { // Adicionado timestamp
      headers: { 'Authorization': `Bearer ${tokenAutenticacao}` }
    });
    if (!resposta.ok) throw new Error('Falha ao buscar categorias.');
    
    const dados = await resposta.json();
    categoriasCarregadas = dados.categories || []; // Supondo que a API retorna { categories: [...] }

    if (categoriasCarregadas.length === 0) {
      DOMElements.containerListaCategorias.innerHTML = '<p class="text-sm text-gray-500">Nenhuma categoria cadastrada.</p>';
      return;
    }
    DOMElements.containerListaCategorias.innerHTML = '';
    categoriasCarregadas.forEach(categoria => {
      const itemCategoria = document.createElement('div');
      itemCategoria.className = 'flex justify-between items-center p-2.5 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200';
      itemCategoria.innerHTML = `
        <span class="text-gray-700 flex-grow">${categoria.nome}</span>
        <div class="space-x-2 flex-shrink-0">
            <button onclick="prepararEdicaoCategoria('${categoria._id}', '${CSS.escape(categoria.nome)}')" class="text-blue-600 hover:text-blue-800 p-1" aria-label="Editar categoria ${categoria.nome}"><i class="fas fa-pencil-alt fa-sm"></i></button>
            <button onclick="confirmarExclusaoCategoria('${categoria._id}')" class="text-red-600 hover:text-red-800 p-1" aria-label="Excluir categoria ${categoria.nome}"><i class="fas fa-trash-alt fa-sm"></i></button>
        </div>
      `;
      DOMElements.containerListaCategorias.appendChild(itemCategoria);
    });
  } catch (erro) {
    console.error("Erro ao carregar/exibir categorias:", erro);
    DOMElements.containerListaCategorias.innerHTML = '<p class="text-sm text-red-500">Erro ao carregar categorias.</p>';
  }
}

async function submeterFormularioCategoria(evento) {
  evento.preventDefault();
  verificarAutenticacaoSessao();

  const nomeCategoria = DOMElements.inputNomeNovaCategoria.value.trim();
  if (!nomeCategoria) {
    alert('Por favor, insira um nome para a categoria.');
    DOMElements.inputNomeNovaCategoria.focus();
    return;
  }

  const idCategoriaEmEdicao = DOMElements.formNovaCategoria.dataset.editingId;
  const urlApi = idCategoriaEmEdicao 
              ? `${ENDPOINT_BASE_API}/categories/${idCategoriaEmEdicao}` 
              : `${ENDPOINT_BASE_API}/categories`;
  const metodoHttp = idCategoriaEmEdicao ? 'PUT' : 'POST';

  DOMElements.btnSalvarNovaCategoria.disabled = true;
  const textoOriginalBotao = DOMElements.btnSalvarNovaCategoria.innerHTML;
  DOMElements.btnSalvarNovaCategoria.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${idCategoriaEmEdicao ? 'Atualizando...' : 'Salvando...'}`;


  try {
    const resposta = await fetch(urlApi, {
      method: metodoHttp,
      headers: {
        'Authorization': `Bearer ${tokenAutenticacao}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: nomeCategoria })
    });

    DOMElements.btnSalvarNovaCategoria.disabled = false;
    DOMElements.btnSalvarNovaCategoria.innerHTML = textoOriginalBotao;

    if (!resposta.ok) {
      const erroData = await resposta.json().catch(() => ({}));
      throw new Error(erroData.erro || `Falha ao ${idCategoriaEmEdicao ? 'atualizar' : 'salvar'} categoria.`);
    }

    DOMElements.inputNomeNovaCategoria.value = '';
    if (idCategoriaEmEdicao) {
        delete DOMElements.formNovaCategoria.dataset.editingId;
        DOMElements.btnSalvarNovaCategoria.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> <span>Adicionar Categoria</span>';
    }
    alert(`Categoria "${nomeCategoria}" ${idCategoriaEmEdicao ? 'atualizada' : 'adicionada'} com sucesso!`);
    await carregarEExibirCategoriasNoModal();
    await carregarCategoriasParaDropdown(); // Atualiza o dropdown no formulário de posts
  } catch (erro) {
    console.error(`Erro ao ${idCategoriaEmEdicao ? 'atualizar' : 'salvar'} categoria:`, erro);
    alert(`Erro: ${erro.message}`);
    DOMElements.btnSalvarNovaCategoria.disabled = false;
    DOMElements.btnSalvarNovaCategoria.innerHTML = textoOriginalBotao;
  }
}

function prepararEdicaoCategoria(id, nomeAtual) {
    DOMElements.inputNomeNovaCategoria.value = nomeAtual; // Preenche o campo com o nome atual
    DOMElements.inputNomeNovaCategoria.focus();
    DOMElements.formNovaCategoria.dataset.editingId = id; // Armazena o ID no formulário para uso na submissão
    DOMElements.btnSalvarNovaCategoria.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i> <span>Atualizar Categoria</span>'; // Muda o texto do botão
}

async function confirmarExclusaoCategoria(id) {
    verificarAutenticacaoSessao();
    if (!confirm('Tem certeza que deseja excluir esta categoria? Se houver posts usando esta categoria, eles não serão excluídos, mas a categoria será removida deles.')) {
        return;
    }
    try {
        const resposta = await fetch(`${ENDPOINT_BASE_API}/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenAutenticacao}` }
        });
        if (!resposta.ok) {
            const erroData = await resposta.json().catch(() => ({}));
            throw new Error(erroData.erro || 'Falha ao excluir categoria.');
        }
        alert('Categoria excluída com sucesso!');
        await carregarEExibirCategoriasNoModal();
        await carregarCategoriasParaDropdown();
    } catch (erro) {
        console.error('Erro ao excluir categoria:', erro);
        alert(`Erro ao excluir: ${erro.message}`);
    }
}

// --- Configuração dos Ouvintes de Eventos ---
function configurarOuvintesDeEventosGlobais() {
  // Botões e formulários de Posts
  if (DOMElements.botaoNovoPost) {
    DOMElements.botaoNovoPost.addEventListener('click', () => {
      limparFormularioEContextoDeEdicao();
      DOMElements.modalEdicaoPost.classList.remove('hidden');
      DOMElements.campoTituloPost.focus();
    });
  }
  if (DOMElements.botaoCancelarEdicaoArtigo) { // ID ATUALIZADO
    DOMElements.botaoCancelarEdicaoArtigo.addEventListener('click', () => {
      DOMElements.modalEdicaoPost.classList.add('hidden');
      limparFormularioEContextoDeEdicao();
    });
  }
  if (DOMElements.botaoFecharModalArtigo && DOMElements.modalEdicaoPost) { // ID ATUALIZADO
      DOMElements.botaoFecharModalArtigo.addEventListener('click', () => DOMElements.modalEdicaoPost.classList.add('hidden'));
  }
  if (DOMElements.botaoLogoutAdmin) {
    DOMElements.botaoLogoutAdmin.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    });
  }
  if (DOMElements.campoUploadImagem) {
    DOMElements.campoUploadImagem.addEventListener('change', exibirPreviaDaImagemSelecionada);
  }
  if (DOMElements.formularioPost) {
    DOMElements.formularioPost.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      await submeterFormularioPost(true);
    });
  }
  if (DOMElements.botaoEnviarPost) {
    DOMElements.botaoEnviarPost.addEventListener('click', async () => {
      await submeterFormularioPost(false);
    });
  }

  // Botões e formulários de Categorias
  if (DOMElements.btnAbrirModalCategorias && DOMElements.modalCategorias) {
    DOMElements.btnAbrirModalCategorias.addEventListener('click', async () => {
      DOMElements.inputNomeNovaCategoria.value = ''; // Limpa o input
      delete DOMElements.formNovaCategoria.dataset.editingId; // Garante que não está em modo de edição
      DOMElements.btnSalvarNovaCategoria.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> <span>Adicionar Categoria</span>'; // Restaura botão
      DOMElements.modalCategorias.classList.remove('hidden');
      await carregarEExibirCategoriasNoModal();
    });
  }
  if (DOMElements.btnFecharModalCategoria && DOMElements.modalCategorias) {
    DOMElements.btnFecharModalCategoria.addEventListener('click', () => DOMElements.modalCategorias.classList.add('hidden'));
  }
  if (DOMElements.btnConcluirModalCategoria && DOMElements.modalCategorias) {
    DOMElements.btnConcluirModalCategoria.addEventListener('click', () => DOMElements.modalCategorias.classList.add('hidden'));
  }
  if (DOMElements.formNovaCategoria) {
    DOMElements.formNovaCategoria.addEventListener('submit', submeterFormularioCategoria);
  }
}

// --- Inicialização do Script ---
document.addEventListener('DOMContentLoaded', async () => {
  verificarAutenticacaoSessao();
  configurarOuvintesDeEventosGlobais();
  await carregarPostsDoServidor(); // Carrega posts
  // As categorias para o dropdown de posts são carregadas dentro de carregarPostsDoServidor -> carregarCategoriasParaDropdown
});

// Exposição global de funções chamadas por onclick dinâmico
window.prepararEdicaoPost = prepararEdicaoPost;
window.confirmarExclusaoPost = confirmarExclusaoPost;
window.prepararEdicaoCategoria = prepararEdicaoCategoria; // Nova
window.confirmarExclusaoCategoria = confirmarExclusaoCategoria; // Nova