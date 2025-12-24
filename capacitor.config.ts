import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.comfaca.credito',
  appName: 'Comfaca Crédito',
  webDir: '.output/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;