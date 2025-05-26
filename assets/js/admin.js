// Configurações globais
const API_BASE = '/api';
let authToken = localStorage.getItem('authToken');
let currentPosts = [];
let currentPostId = null;
let imagemSelecionada = '';

// Seleção dos elementos do DOM
const dom = {
  postsList: document.getElementById('postsList'),
  editModal: document.getElementById('editModal'),
  postTitle: document.getElementById('postTitle'),
  postExcerpt: document.getElementById('postExcerpt'),
  postContent: document.getElementById('postContent'),
  postCategory: document.getElementById('postCategory'),
  imageUpload: document.getElementById('imageUpload'),
  thumbPreview: document.getElementById('thumbPreview'),
  postForm: document.getElementById('postForm'),
  postStatus: document.getElementById('postStatus'),
  cancelarEdicao: document.getElementById('cancelarEdicao'),
  btnNovoPost: document.getElementById('btnNovoPost'),
  btnEnviarPost: document.getElementById('btnEnviarPost'),
  botaoLogout: document.getElementById('botaoLogout'),
};

// Verifica autenticação
function authCheck() {
  if (!authToken) {
    alert('Sessão expirada! Redirecionando...');
    window.location.href = '/login.html';
  }
}

// Ao carregar DOM
document.addEventListener('DOMContentLoaded', () => {
  authCheck();
  setupEventListeners();
  loadPosts();
});

// Listeners
function setupEventListeners() {
  if (dom.btnNovoPost) {
    dom.btnNovoPost.addEventListener('click', () => {
      resetForm();
      dom.editModal.classList.remove('hidden');
    });
  }

  if (dom.cancelarEdicao) {
    dom.cancelarEdicao.addEventListener('click', () => {
      dom.editModal.classList.add('hidden');
      resetForm();
    });
  }

  if (dom.botaoLogout) {
    dom.botaoLogout.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = '/login.html';
    });
  }

  dom.imageUpload.addEventListener('change', handleImagePreview);
  dom.postForm.addEventListener('submit', adicionarCardRascunho);
  dom.btnEnviarPost.addEventListener('click', enviarPostParaAPI); // ← Aqui está o botão que faltava
}

// Preview da imagem no admin
function handleImagePreview(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      dom.thumbPreview.src = event.target.result;
      dom.thumbPreview.classList.remove('hidden');
      imagemSelecionada = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Adiciona visualmente um rascunho ao admin
function adicionarCardRascunho(e) {
  e.preventDefault();

  const titulo = dom.postTitle.value;
  const categoria = dom.postCategory.value;
  const resumo = dom.postExcerpt.value;
  const conteudo = dom.postContent.value;

  const novoCard = document.createElement('div');
  novoCard.className = 'bg-white rounded-xl shadow-md p-5 border border-yellow-200';

  novoCard.innerHTML = `
    <img src="${imagemSelecionada || 'placeholder.jpg'}" alt="Imagem do artigo" class="w-full h-40 object-cover rounded-lg mb-4" />
    <h3 class="text-xl font-bold text-[#8B4513] mb-2">${titulo}</h3>
    <p class="text-sm text-gray-600 mb-1"><strong>Categoria:</strong> ${categoria}</p>
    <p class="text-gray-700 mb-2">${resumo}</p>
    <span class="inline-block text-xs text-yellow-600 font-semibold">Rascunho</span>
  `;

  dom.postsList.appendChild(novoCard);
  dom.editModal.classList.add('hidden');
  resetForm();
}

// Carrega posts da API (artigos publicados)
async function loadPosts() {
  try {
    const response = await fetch(`${API_BASE}/posts`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Erro ao carregar posts');
    currentPosts = await response.json();
    renderPosts();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar artigos!');
  }
}

// Renderiza artigos publicados no admin
function renderPosts() {
  dom.postsList.innerHTML = currentPosts.map(post => `
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-accent">${post.title}</h3>
          <div class="mt-2 text-sm text-gray-600">
            <span class="mr-4">${new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
            <span class="bg-accent/10 text-accent px-2 py-1 rounded">${post.category}</span>
            <span class="ml-2 ${post.status === 'published' ? 'text-green-600' : 'text-yellow-600'}">
              (${post.status === 'published' ? 'Publicado' : 'Rascunho'})
            </span>
          </div>
        </div>
        <div class="flex gap-3 ml-4">
          <button onclick="startEdit('${post._id}')" class="text-gold hover:text-accent">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deletePost('${post._id}')" class="text-red-600 hover:text-red-800">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Envia post para API e publica no site
async function enviarPostParaAPI(e) {
  e.preventDefault();

  const postData = {
    title: dom.postTitle.value,
    excerpt: dom.postExcerpt.value,
    content: dom.postContent.value,
    category: dom.postCategory.value,
    image: imagemSelecionada || 'placeholder.jpg',
    status: dom.postStatus.value || 'draft',
  };

  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) throw new Error('Erro ao enviar post para a API');

    const novoPost = await response.json();
    currentPosts.unshift(novoPost);
    renderPosts();

    dom.editModal.classList.add('hidden');
    resetForm();
  } catch (error) {
    console.error('Erro ao publicar:', error);
    alert('Erro ao publicar o artigo.');
  }
}

// Reset total do formulário e imagem
function resetForm() {
  currentPostId = null;
  dom.postForm.reset();
  dom.thumbPreview.src = 'placeholder.jpg';
  dom.thumbPreview.classList.add('hidden');
  dom.imageUpload.value = '';
  imagemSelecionada = '';
}

// (Futuramente) Editar e excluir posts (placeholder)
function startEdit(id) {
  alert(`Função de edição para ID: ${id} ainda será implementada.`);
}

function deletePost(id) {
  alert(`Função de exclusão para ID: ${id} ainda será implementada.`);
}

// Exporta funções globais para os botões inline
window.startEdit = startEdit;
window.deletePost = deletePost;
