// Configurações globais: definição da base da API e inicialização de variáveis de sessão
const API_BASE = '/api';
let authToken = localStorage.getItem('authToken');
let currentPosts = [];
let currentPostId = null;

// Seleção e validação de elementos do DOM — IDs devem corresponder ao HTML
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
    cancelButton: document.getElementById('cancelButton')
};

// Verifica se o usuário está autenticado e redireciona em caso negativo
function authCheck() {
    if (!authToken) {
        alert('Sessão expirada! Redirecionando...');
        window.location.href = '/login.html';
    }
}

// Inicialização ao carregar o DOM: autentica, configura listeners e carrega artigos
document.addEventListener('DOMContentLoaded', () => {
    authCheck();
    setupEventListeners();
    loadPosts();
});

// Registra eventos de submit do formulário, upload de imagem e cancelamento
function setupEventListeners() {
    dom.postForm.addEventListener('submit', savePost);
    dom.imageUpload.addEventListener('change', handleImageUpload);
    dom.cancelButton.addEventListener('click', cancelEdit);
}

// Busca lista de posts na API e atualiza a interface
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

// Renderiza cada post como um card no painel
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

// Trata upload de imagem: envia arquivo e atualiza preview
async function handleImageUpload(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        const data = await response.json();
        dom.thumbPreview.src = data.url;
        dom.thumbPreview.classList.remove('hidden');
    } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao enviar imagem!');
    }
}

// Cria ou atualiza artigo na API com base em currentPostId
async function savePost(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', dom.postTitle.value);
    formData.append('content', dom.postContent.value);
    formData.append('excerpt', dom.postExcerpt.value);
    formData.append('category', dom.postCategory.value);
    formData.append('status', dom.postStatus.value);

    if (dom.imageUpload.files[0]) {
        formData.append('image', dom.imageUpload.files[0]);
    }

    try {
        const method = currentPostId ? 'PUT' : 'POST';
        const url = currentPostId ? `${API_BASE}/posts/${currentPostId}` : `${API_BASE}/posts`;
        const response = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        if (!response.ok) throw new Error('Erro ao salvar post');
        dom.editModal.classList.add('hidden');
        loadPosts();
        resetForm();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar post!');
    }
}

// Exclui post após confirmação do usuário
async function deletePost(id) {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

    try {
        const response = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Erro ao excluir post');
        loadPosts();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir post!');
    }
}

// Preenche formulário com dados do post selecionado para edição
function startEdit(id) {
    const post = currentPosts.find(p => p._id === id);
    if (!post) return;

    currentPostId = id;
    dom.postTitle.value = post.title;
    dom.postContent.value = post.content;
    dom.postExcerpt.value = post.excerpt;
    dom.postCategory.value = post.category;
    dom.postStatus.value = post.status;
    dom.thumbPreview.src = post.thumbnail || 'placeholder.jpg';
    dom.thumbPreview.classList.remove('hidden');
    dom.editModal.classList.remove('hidden');
}

// Fecha modal de edição e limpa o formulário
function cancelEdit() {
    dom.editModal.classList.add('hidden');
    resetForm();
}

// Reseta estado de edição e limpa campos do formulário
function resetForm() {
    currentPostId = null;
    dom.postForm.reset();
    dom.thumbPreview.src = '';
    dom.thumbPreview.classList.add('hidden');
    dom.imageUpload.value = '';
}

// Disponibiliza funções globais para botões inline
window.startEdit = startEdit;
window.deletePost = deletePost;
