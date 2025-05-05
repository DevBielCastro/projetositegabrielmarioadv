// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js') // Corrigido o caminho
            .then(registration => console.log('SW registrado com sucesso'))
            .catch(err => console.log('Falha no registro do SW:', err));
    });
}

// Inicialização do Alpine.js
document.addEventListener('alpine:init', () => {
    Alpine.data('areasAtuacao', () => ({
        openArea: null,
        
        toggleArea(key) {
            this.openArea = this.openArea === key ? null : key
        }
    }))
})

// Verificação de contraste (se necessário)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.logo').forEach(logo => {
        const bgColor = getComputedStyle(logo.parentElement).backgroundColor;
        const contrast = getContrastRatio('#D4AF37', bgColor);
        if(contrast < 4.5) logo.classList.add('logo-alerta');
    });
});