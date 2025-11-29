import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const currentWorkingDirectory = `${process.cwd()}`;
  console.log('Vite mode:', mode, 'CWD:', currentWorkingDirectory);
  const envVariables = loadEnv(mode, currentWorkingDirectory);
  console.log(envVariables);
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
    ],
    envDir: `${currentWorkingDirectory}/`,
    base: (envVariables.VITE_APP_BASE_URL || '') + '/',
  };
})
