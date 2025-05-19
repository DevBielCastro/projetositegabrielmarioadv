// Configurações Globais
const API_BASE = '/api';
let authToken = localStorage.getItem('authToken');
let currentPostId = null;

// Elementos DOM com validação
const domElements = {
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
  cancelButton: document.getElementById('cancelButton'),
  btnLogout: document.getElementById('btnLogout'),
  btnNovoPost: document.getElementById('btnNovoPost')
};

// Verificação de Autenticação Reforçada
async function authCheck() {
  if (!authToken) redirectToLogin();
  
  try {
    const response = await fetch(`${API_BASE}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!response.ok) throw new Error('Token inválido');
  } catch (error) {
    console.error('Falha na autenticação:', error);
    redirectToLogin();
  }
}

// Controle de Posts
async function loadPosts() {
  try {
    showLoader();
    
    const response = await fetch(`${API_BASE}/posts`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    currentPosts = data.posts;
    renderPosts();
  } catch (error) {
    showError('Erro ao carregar posts:', error);
  } finally {
    hideLoader();
  }
}

// Renderização Otimizada de Posts
function renderPosts() {
  domElements.postsList.innerHTML = currentPosts.map(post => `
    <div class="bg-white p-6 rounded-lg shadow-md mb-6 post-item" data-id="${post._id}">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-accent">${escapeHTML(post.title)}</h3>
          <div class="mt-2 text-sm text-gray-600">
            <span class="mr-4">${new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
            <span class="bg-accent/10 text-accent px-2 py-1 rounded">${post.category}</span>
            <span class="ml-2 ${post.status === 'published' ? 'text-green-600' : 'text-yellow-600'}">
              (${post.status === 'published' ? 'Publicado' : 'Rascunho'})
            </span>
          </div>
          ${post.thumbnail ? `<img src="${post.thumbnail}" alt="Thumbnail" class="mt-4 w-32 h-32 object-cover">` : ''}
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

// Upload Seguro de Imagens
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });

    const data = await response.json();
    domElements.thumbPreview.src = data.url;
    domElements.thumbPreview.classList.remove('hidden');
  } catch (error) {
    showError('Erro no upload de imagem:', error);
  }
}

// Controle de Formulário
async function savePost(event) {
  event.preventDefault();
  
  const formData = new FormData();
  formData.append('title', domElements.postTitle.value);
  formData.append('content', domElements.postContent.value);
  formData.append('excerpt', domElements.postExcerpt.value);
  formData.append('category', domElements.postCategory.value);
  formData.append('status', domElements.postStatus.value);

  if (domElements.imageUpload.files[0]) {
    formData.append('image', domElements.imageUpload.files[0]);
  }

  try {
    const method = currentPostId ? 'PUT' : 'POST';
    const url = currentPostId ? `${API_BASE}/posts/${currentPostId}` : `${API_BASE}/posts`;

    const response = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });

    if (!response.ok) throw new Error('Erro na resposta do servidor');

    domElements.editModal.classList.add('hidden');
    await loadPosts();
    resetForm();
  } catch (error) {
    showError('Erro ao salvar post:', error);
  }
}

// Funções Auxiliares
function escapeHTML(str) {
  return str.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#039;');
}

function showLoader() {
  domElements.postsList.innerHTML = '<div class="text-center py-8">Carregando...</div>';
}

function redirectToLogin() {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
}

function showError(context, error) {
  console.error(context, error);
  alert(`${context} ${error.message}`);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Validação de elementos DOM
  Object.values(domElements).forEach(element => {
    if (!element) console.error('Elemento DOM não encontrado:', element);
  });

  authCheck();
  setupEventListeners();
  loadPosts();
});

function setupEventListeners() {
  domElements.btnLogout.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    redirectToLogin();
  });

  domElements.btnNovoPost.addEventListener('click', () => {
    currentPostId = null;
    resetForm();
    domElements.editModal.classList.remove('hidden');
  });

  domElements.postForm.addEventListener('submit', savePost);
  domElements.imageUpload.addEventListener('change', handleImageUpload);
  domElements.cancelButton.addEventListener('click', () => {
    domElements.editModal.classList.add('hidden');
    resetForm();
  });
}

// Export para escopo global
window.startEdit = startEdit;
window.deletePost = deletePost;