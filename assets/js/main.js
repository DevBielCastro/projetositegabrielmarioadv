// assets/js/main.js

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado com sucesso:', registration.scope);
            })
            .catch(err => {
                console.log('Falha no registro do ServiceWorker:', err);
            });
    });
}

// Inicialização do AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-in-out-quad',
        mirror: false
    });

    // Reinicia animações ao alternar páginas
    window.addEventListener('load', AOS.refresh);
});

// Controle das áreas de atuação com Alpine.js
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        openArea: null,
        
        toggleArea(key) {
            this.openArea = this.openArea === key ? null : key;
            
            // Força redesenho para animações
            setTimeout(() => {
                AOS.refresh();
            }, 300);
        },

        init() {
            // Fecha todas as áreas ao carregar
            this.openArea = null;
            
            // Verificação de contraste para logos
            document.querySelectorAll('.logo-container').forEach(container => {
                const bgColor = getComputedStyle(container).backgroundColor;
                const contrast = getContrastRatio('#D4AF37', bgColor);
                if(contrast < 4.5) container.classList.add('low-contrast');
            });
        }
    }));
});

// Função auxiliar de contraste
function getContrastRatio(color1, color2) {
    // Implementação simplificada
    const luminance1 = 1; // Simulação
    const luminance2 = 0.2; // Simulação
    return (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);
}

// Hot Reload para desenvolvimento
if (window.location.hostname === 'localhost') {
    new EventSource('/esbuild').addEventListener('change', () => location.reload());
}