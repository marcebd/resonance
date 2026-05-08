type EnvShape = {
  ANTHROPIC_API_KEY: string;
  KV_REST_API_URL: string;
  KV_REST_API_TOKEN: string;
};

function required(name: keyof EnvShape): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Run \`vercel env pull .env.development.local\` after linking the project.`,
    );
  }
  return value;
}

export const env: EnvShape = {
  get ANTHROPIC_API_KEY() {
    return required('ANTHROPIC_API_KEY');
  },
  get KV_REST_API_URL() {
    return required('KV_REST_API_URL');
  },
  get KV_REST_API_TOKEN() {
    return required('KV_REST_API_TOKEN');
  },
};
