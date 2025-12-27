import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.comfaca.credito',
  appName: 'Comfaca Crédito',
  webDir: '.output/public',
  loggingBehavior: 'debug',
  zoomEnabled: false,
  backgroundColor: '#fff',
  server: {
    androidScheme: 'http',
    allowNavigation: ['*']
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
    CapacitorHttp: {
      enabled: true
    },
  },
  cordova: {
    accessOrigins: ['http://172.168.0.15:5001'],
  }
};

export default config;