// Grove's configuration, read from the environment (research R11). Secrets have no defaults and
// are never logged (constitution 2.1).

const SECRET_KEYS = ['FIREBASE_API_KEY', 'FIREBASE_SERVICE_ACCOUNT_FILE', 'GITHUB_TOKEN'];

export function loadConfig(env = process.env, { needGithub = false } = {}) {
  const missing = ['GROVE_DATA_DIR', 'GROVE_BACKUP_DIR', 'FIREBASE_PROJECT_ID', 'FIREBASE_API_KEY', 'FIREBASE_SERVICE_ACCOUNT_FILE']
    .concat(needGithub ? ['GITHUB_TOKEN', 'GITHUB_REPO'] : [])
    .filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`grove: missing settings: ${missing.join(', ')}`);
  }
  return makeConfig({
    port: Number(env.GROVE_PORT || 8787),
    dataDir: env.GROVE_DATA_DIR,
    backupDir: env.GROVE_BACKUP_DIR,
    answerMinMs: env.GROVE_ANSWER_MIN_MS === undefined ? 1200 : Number(env.GROVE_ANSWER_MIN_MS),
    firebase: {
      projectId: env.FIREBASE_PROJECT_ID,
      apiKey: env.FIREBASE_API_KEY,
      serviceAccountFile: env.FIREBASE_SERVICE_ACCOUNT_FILE,
      authUrl: env.FIREBASE_AUTH_URL || 'https://identitytoolkit.googleapis.com',
      tokenUrl: env.FIREBASE_TOKEN_URL || 'https://oauth2.googleapis.com/token',
      certsUrl: env.FIREBASE_CERTS_URL || 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    },
    github: {
      apiUrl: env.GITHUB_API_URL || 'https://api.github.com',
      repo: env.GITHUB_REPO || '',
      token: env.GITHUB_TOKEN || '',
    },
  });
}

// Freezes a config object and keeps secret values out of JSON and inspection.
export function makeConfig(config) {
  const hidden = { apiKey: config.firebase.apiKey, token: config.github?.token };
  const firebase = { ...config.firebase };
  const github = { ...(config.github || {}) };
  Object.defineProperty(firebase, 'apiKey', { value: hidden.apiKey, enumerable: false });
  Object.defineProperty(github, 'token', { value: hidden.token, enumerable: false });
  if (config.firebase.serviceAccount) {
    Object.defineProperty(firebase, 'serviceAccount', { value: config.firebase.serviceAccount, enumerable: false });
  }
  return Object.freeze({ ...config, firebase: Object.freeze(firebase), github: Object.freeze(github) });
}

export { SECRET_KEYS };
