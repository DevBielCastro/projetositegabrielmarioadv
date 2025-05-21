// Registra o Service Worker para habilitar funcionalidades offline e atualizações em segundo plano
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

// Inicializa o AOS (Animate On Scroll) e configura atualização após carregamento completo
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-in-out-quad',
        mirror: false
    });

    // Recarrega animações ao alternar páginas
    window.addEventListener('load', AOS.refresh);
});

// Define componente Alpine.js para controlar áreas de atuação
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        openArea: null,
        
        // Alterna visibilidade de uma área específica
        toggleArea(key) {
            this.openArea = (this.openArea === key) ? null : key;
            // Garante redesenho das animações após alternância
            setTimeout(() => AOS.refresh(), 300);
        },

        // Método chamado na inicialização do componente
        init() {
            this.openArea = null; // Fecha todas as áreas ao iniciar
            
            // Avalia contraste de logos para acessibilidade
            document.querySelectorAll('.logo-container').forEach(container => {
                const bgColor = getComputedStyle(container).backgroundColor;
                const contrast = getContrastRatio('#D4AF37', bgColor);
                if (contrast < 4.5) container.classList.add('low-contrast');
            });
        }
    }));
});

// Calcula razão de contraste simplificada entre duas cores (exemplo de implementação)
function getContrastRatio(color1, color2) {
    const luminance1 = 1; // Valor simulado para luminância
    const luminance2 = 0.2; // Valor simulado para luminância
    return (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);
}

// Habilita recarregamento automático em ambiente de desenvolvimento (localhost)
if (window.location.hostname === 'localhost') {
    new EventSource('/esbuild').addEventListener('change', () => location.reload());
}
