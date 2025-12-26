// scripts/dev-tools.js
import { spawn } from 'node:child_process';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

const port = process.env.NUXT_PORT || 5173;

const run = (command, { allowNonZeroExit = false } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0 || allowNonZeroExit) return resolve();
      return reject(new Error(`Comando falló (exit ${code}): ${command}`));
    });
  });

const actions = new Map([
  [
    '1',
    {
      title: 'Live Reload en Emulador',
      run: () =>
        run(
          `pnpm dev & npx cap run android --target ZY32DD9HMT -l --host 10.0.2.2 --port ${port}`
        ),
    },
  ],
  [
    '2',
    {
      title: 'Live Reload en Dispositivo USB',
      run: () =>
        run(
          `pnpm dev & npx cap run android --target ZY32DD9HMT -l --host localhost --port ${port} --forwardPorts ${port}:${port}`
        ),
    },
  ],
  [
    '3',
    {
      title: 'Build y Sincronizar',
      run: () => run('pnpm build && npx cap sync android'),
    },
  ],
  [
    '4',
    {
      title: 'Limpiar cache Android',
      run: () => run('cd android && ./gradlew clean'),
    },
  ],
  [
    '5',
    {
      title: 'Ver logs de la app',
      run: () =>
        run('adb logcat | grep "capacitor|Console|E/AndroidRuntime"', {
          allowNonZeroExit: true,
        }),
    },
  ],
  [
    '6',
    {
      title: 'Reiniciar servidor ADB',
      run: () => run('adb kill-server && adb start-server'),
    },
  ],
]);

const printMenu = () => {
  console.log('🛠️  Herramientas de Desarrollo Capacitor');
  console.log('=====================================');
  for (const [key, action] of actions) {
    console.log(`${key}. ${action.title}`);
  }
  console.log('=====================================');
};

const main = async () => {
  const rl = createInterface({ input, output });

  try {
    printMenu();
    const option = (
      await rl.question(`Selecciona una opción (1-${actions.size}): `)
    ).trim();
    const action = actions.get(option);

    if (!action) {
      console.error('Opción inválida');
      return;
    }

    console.log(`Ejecutando: ${action.title}...`);
    await action.run();
  } catch (error) {
    console.error(error?.message ?? error);
  } finally {
    rl.close();
  }
};

await main();
