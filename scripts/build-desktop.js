import { createInterface } from "readline";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import path from "path";

// Aggiungiamo i binari .cmd per Windows se necessario
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    const platform = await ask("Which platform? (mac/win/linux): ");
    let flag = "";
    if (platform === "mac") flag = "--mac";
    else if (platform === "win") flag = "--win";
    else if (platform === "linux") flag = "--linux";
    else {
        console.log("Invalid platform");
        rl.close();
        return;
    }

    const appId = await ask("App ID (default: com.electron.react.tailwind): ");
    const productName = await ask("Product name (default: YourAppName): ");

    try {
        const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

        // Imposta la versione del prodotto per il build
        const version = pkg.version;

        if (appId) pkg.build.appId = appId;
        if (productName) pkg.build.productName = productName;

        // Aggiungiamo la versione al nome del prodotto, tipico per gli installer
        if (pkg.build.productName) {
            pkg.build.productName = `${pkg.build.productName} v${version}`;
        }

        // Scrive la configurazione temporanea
        const tempConfigPath = path.join(process.cwd(), "temp-config.json");
        writeFileSync(tempConfigPath, JSON.stringify(pkg.build, null, 2));

        console.log("Building Electron Main/Renderer...");
        // 1. Compila il TypeScript (il tsc è ancora necessario per il processo Main di Electron)
        execSync(`${npx} tsc`, { stdio: "inherit" });

        // 2. Esegue il build di Vite per Renderer e Main (Vite usa la configurazione Vite.config.ts)
        // La fase 'tsc' serve per la corretta preparazione del codice TypeScript per Vite
        execSync(`${npx} vite build`, { stdio: "inherit" });

        console.log("Packaging with Electron Builder...");
        // 3. Esegue Electron Builder, passando la configurazione temporanea
        execSync(`${npx} electron-builder --config ${tempConfigPath} ${flag}`, {
            stdio: "inherit",
        });

        // 4. Pulisce il file temporaneo
        unlinkSync(tempConfigPath);

        console.log("Build complete! Check the 'release' directory.");

    } catch (error) {
        console.error("An error occurred during the build process:", error);
    } finally {
        rl.close();
    }
}

main();