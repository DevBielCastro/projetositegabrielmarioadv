// assets/js/admin.js

// Configurações da API
const API_BASE = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');

// Sistema de Autenticação
function authCheck() {
    if (!authToken) {
        window.location.href = '/login.html';
    }
}

// Estado da Aplicação
let currentPosts = [];
let currentPostId = null;

// Elementos DOM
const dom = {
    postsList: document.getElementById('postsList'),
    editModal: document.getElementById('editModal'),
    postTitle: document.getElementById('postTitle'),
    postExcerpt: document.getElementById('postExcerpt'),
    postContent: document.getElementById('postContent'),
    postCategory: document.getElementById('postCategory'),
    postThumbnail: document.getElementById('postThumbnail'),
    postStatus: document.getElementById('postStatus'),
    saveButton: document.getElementById('saveButton'),
    cancelButton: document.getElementById('cancelButton'),
    imageUpload: document.getElementById('imageUpload'),
    thumbPreview: document.getElementById('thumbPreview')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    authCheck();
    setupEventListeners();
    loadPosts();
});

function setupEventListeners() {
    document.getElementById('newPostButton').addEventListener('click', newPost);
    dom.saveButton.addEventListener('click', savePost);
    dom.cancelButton.addEventListener('click', cancelEdit);
    dom.imageUpload.addEventListener('change', handleImageUpload);
}

// Carregar Posts da API
async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE}/posts`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
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

// Renderizar Posts
function renderPosts() {
    dom.postsList.innerHTML = currentPosts.map(post => `
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h3 class="text-xl font-semibold text-accent">${post.title}</h3>
                    <div class="mt-2 text-sm text-gray-600">
                        <span class="mr-4">${post.date}</span>
                        <span class="bg-accent/10 text-accent px-2 py-1 rounded">${post.category}</span>
                        <span class="ml-2 text-sm ${post.status === 'published' ? 'text-green-600' : 'text-yellow-600'}">
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

// Upload de Imagem
async function handleImageUpload(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        dom.thumbPreview.src = data.url;
        dom.postThumbnail.value = data.url;
    } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao enviar imagem!');
    }
}

// Funções de CRUD
async function savePost() {
    const postData = {
        title: dom.postTitle.value,
        excerpt: dom.postExcerpt.value,
        content: dom.postContent.value,
        category: dom.postCategory.value,
        thumbnail: dom.postThumbnail.value,
        status: dom.postStatus.value
    };

    try {
        const url = currentPostId 
            ? `${API_BASE}/posts/${currentPostId}`
            : `${API_BASE}/posts`;

        const method = currentPostId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) throw new Error('Erro ao salvar post');

        dom.editModal.classList.add('hidden');
        loadPosts();
        alert('Post salvo com sucesso!');
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar post!');
    }
}

async function deletePost(id) {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

    try {
        const response = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) throw new Error('Erro ao excluir post');
        
        loadPosts();
        alert('Post excluído com sucesso!');
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir post!');
    }
}

// Funções auxiliares
function newPost() {
    currentPostId = null;
    resetForm();
    dom.editModal.classList.remove('hidden');
}

function startEdit(id) {
    const post = currentPosts.find(p => p._id === id);
    if (post) {
        currentPostId = id;
        populateForm(post);
        dom.editModal.classList.remove('hidden');
    }
}

function populateForm(post) {
    dom.postTitle.value = post.title;
    dom.postExcerpt.value = post.excerpt;
    dom.postContent.value = post.content;
    dom.postCategory.value = post.category;
    dom.postThumbnail.value = post.thumbnail;
    dom.postStatus.value = post.status;
    dom.thumbPreview.src = post.thumbnail || 'placeholder.jpg';
}

function resetForm() {
    dom.postTitle.value = '';
    dom.postExcerpt.value = '';
    dom.postContent.value = '';
    dom.postCategory.value = 'Geral';
    dom.postThumbnail.value = '';
    dom.postStatus.value = 'draft';
    dom.thumbPreview.src = 'placeholder.jpg';
}

function cancelEdit() {
    dom.editModal.classList.add('hidden');
    resetForm();
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/';
}

// Exportar funções para o escopo global
window.startEdit = startEdit;
window.deletePost = deletePost;