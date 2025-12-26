import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.comfaca.credito',
  appName: 'Comfaca Crédito',
  webDir: '.output/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      androidPermissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
      allowEditing: false,
      saveToGallery: false,
      direction: 'REAR',
    },
  },
};

export default config;