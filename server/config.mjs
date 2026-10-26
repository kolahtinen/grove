// Grove's configuration, read from the environment (research R11). Secrets have no defaults and
// are never logged (constitution 2.1).

const SECRET_KEYS = ['FIREBASE_API_KEY', 'FIREBASE_SERVICE_ACCOUNT_FILE', 'GITHUB_TOKEN'];

// Each process asks for and keeps only its own role's settings: `web` (grove's server and the owner
// commands) never holds the GitHub token, `tunnel` never holds Firebase settings (FR-004, research R11).
const NEEDED = {
  web: ['GROVE_DATA_DIR', 'GROVE_BACKUP_DIR', 'FIREBASE_PROJECT_ID', 'FIREBASE_API_KEY', 'FIREBASE_SERVICE_ACCOUNT_FILE'],
  tunnel: ['GROVE_DATA_DIR', 'GITHUB_TOKEN', 'GITHUB_REPO'],
};

// Prompt sizes (G-02 FR-202, RQ-392): environment settings with defaults, tuned from the probe test.
const SIZES = {
  partReading: ['GROVE_PART_READING', 2],
  partListening: ['GROVE_PART_LISTENING', 1],
  textWords: ['GROVE_TEXT_WORDS', 90],
  setupChunkWords: ['GROVE_SETUP_CHUNK_WORDS', 500],
  setupMaxWords: ['GROVE_SETUP_MAX_WORDS', 3000],
  checkMeanings: ['GROVE_CHECK_MEANINGS', 20],
  ownPieceChars: ['GROVE_OWN_PIECE_CHARS', 2500],
};
export const DEFAULT_SIZES = Object.freeze(Object.fromEntries(Object.entries(SIZES).map(([k, [, v]]) => [k, v])));

export function promptSizes(env = {}) {
  const out = {};
  for (const [key, [name, fallback]] of Object.entries(SIZES)) {
    const raw = env[name];
    if (raw === undefined || raw === '') { out[key] = fallback; continue; }
    if (!/^[1-9][0-9]{0,5}$/.test(String(raw))) throw new Error(`grove: ${name} must be a positive whole number`);
    out[key] = Number(raw);
  }
  return out;
}

export function loadConfig(env = process.env, { role } = {}) {
  if (!Object.hasOwn(NEEDED, role)) throw new Error('grove: loadConfig needs a role (web or tunnel)');
  const missing = NEEDED[role].filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`grove: missing settings: ${missing.join(', ')}`);
  }
  return makeConfig({
    port: Number(env.GROVE_PORT || 8787),
    dataDir: env.GROVE_DATA_DIR,
    backupDir: role === 'web' ? env.GROVE_BACKUP_DIR : undefined,
    answerMinMs: env.GROVE_ANSWER_MIN_MS === undefined ? 1200 : Number(env.GROVE_ANSWER_MIN_MS),
    sizes: role === 'web' ? promptSizes(env) : undefined,
    firebase: role === 'web' ? {
      projectId: env.FIREBASE_PROJECT_ID,
      apiKey: env.FIREBASE_API_KEY,
      serviceAccountFile: env.FIREBASE_SERVICE_ACCOUNT_FILE,
      authUrl: env.FIREBASE_AUTH_URL || 'https://identitytoolkit.googleapis.com',
      tokenUrl: env.FIREBASE_TOKEN_URL || 'https://oauth2.googleapis.com/token',
      certsUrl: env.FIREBASE_CERTS_URL || 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    } : {},
    github: role === 'tunnel' ? {
      apiUrl: env.GITHUB_API_URL || 'https://api.github.com',
      repo: env.GITHUB_REPO,
      token: env.GITHUB_TOKEN,
    } : {},
  });
}

// Freezes a config object and keeps secret values out of JSON and inspection.
export function makeConfig(config) {
  const hidden = { apiKey: config.firebase?.apiKey, token: config.github?.token };
  const firebase = { ...(config.firebase || {}) };
  const github = { ...(config.github || {}) };
  Object.defineProperty(firebase, 'apiKey', { value: hidden.apiKey, enumerable: false });
  Object.defineProperty(github, 'token', { value: hidden.token, enumerable: false });
  if (config.firebase?.serviceAccount) {
    Object.defineProperty(firebase, 'serviceAccount', { value: config.firebase.serviceAccount, enumerable: false });
  }
  const sizes = Object.freeze({ ...DEFAULT_SIZES, ...(config.sizes || {}) });
  return Object.freeze({ ...config, sizes, firebase: Object.freeze(firebase), github: Object.freeze(github) });
}

export { SECRET_KEYS };
