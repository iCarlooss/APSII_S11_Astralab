import { defineConfig, loadEnv } from 'vite'; // Importe o loadEnv
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ''); // Carrega as variáveis do .env

    return {
        plugins: [
            laravel({
                input: 'resources/js/app.tsx',
                refresh: true,
            }),
            react(),
        ],
        server: {
            host: '0.0.0.0',
            hmr: {
                // Ele vai usar o IP que estiver no .env ou o 'localhost' como padrão
                host: env.VITE_HMR_HOST || 'localhost', 
            },
        },
    };
});