import { defineConfig } from "vite";
import { fileURLToPath } from 'url';
import path from "path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definiamo le dipendenze da escludere (moduli nativi/Node.js)
const externalDependencies = ['electron', 'better-sqlite3']; // <-- AGGIUNTO better-sqlite3

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
        vite: {
          define: {
            '__dirname': JSON.stringify(__dirname),
            '__filename': JSON.stringify(__filename),
          },
          build: {
            rollupOptions: {
              external: externalDependencies,
              // Aggiungiamo un'opzione specifica per la risoluzione dei moduli nativi
              output: {
                // Questo rende il codice JavaScript più compatibile con CommonJS
                // dove vengono usati i require dinamici per i moduli nativi.
                format: 'cjs',
              }
            },
          },
          // 💡 AGGIUNGIAMO QUESTE OPZIONI PER INDICARE LA PIATTAFORMA NODE
          env: {
            NODE_ENV: process.env.NODE_ENV,
          },
          // Rimuove 'node' come dipendenza risolvibile in modo dinamico
          resolve: {
            alias: {
              'path': 'path-browserify',
            }
          }
        },
      },
      // ... (il resto rimane invariato)
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
      renderer:
          process.env.NODE_ENV === "test"
              ? undefined
              : {},
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'path': 'path-browserify',
    },
  },
  build: {
    rollupOptions: {
      // Manteniamo qui solo le dipendenze esterne principali
      external: externalDependencies,
    },
  },
});