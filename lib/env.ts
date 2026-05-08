type EnvShape = {
  ANTHROPIC_API_KEY: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
};

function required(name: keyof EnvShape): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Run \`vercel env pull .env.local\` after linking the project.`,
    );
  }
  return value;
}

export const env: EnvShape = {
  get ANTHROPIC_API_KEY() {
    return required('ANTHROPIC_API_KEY');
  },
  get UPSTASH_REDIS_REST_URL() {
    return required('UPSTASH_REDIS_REST_URL');
  },
  get UPSTASH_REDIS_REST_TOKEN() {
    return required('UPSTASH_REDIS_REST_TOKEN');
  },
};
