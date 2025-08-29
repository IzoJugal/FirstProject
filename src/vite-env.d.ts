/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACK_URL: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_OFFICE_ADDRESS: string;
  readonly VITE_GOOGLE_MAP_QUERY: string;
  readonly VITE_ORG_CONTACT: string;
  readonly VITE_GPLAY: string;
  readonly VITE_IOS: string;
  readonly VITE_FIREBASE_VAPID_KEY: string;
  readonly VITE_FIREBASE_APIKEY: string;
  readonly VITE_FIREBASE_AUTHDOMAIN: string;
  readonly VITE_FIREBASE_PROJECTID: string;
  readonly VITE_FIREBASE_STORAGEBUCKET: string;
  readonly VITE_FIREBASE_MESSAGINGSENDERID: string;
  readonly VITE_FIREBASE_APPID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
