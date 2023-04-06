import fs from 'fs';

export function getSecret(
  secretFileEnv: string,
  secretPlainEnv?: string,
  secretDefault?: string
): string | undefined {
  // (secretPlainEnv || secretDefault) may be undefined - that's ok!
  let secret = process.env[secretPlainEnv] || secretDefault;

  const secretFile = process.env[secretFileEnv];
  if (secretFile && fs.existsSync(secretFile)) {
    try {
      secret = fs.readFileSync(secretFile).toString();
    } catch (err: unknown) {
      console.log('Could not read pw file. Using Fallback.', err);
    }
  }

  // can only be undefined if no default is given!
  return secret;
}
