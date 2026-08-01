export class AuthenticationConfigurationError extends Error {
  constructor() {
    super("Authentication configuration is unavailable");
    this.name = "AuthenticationConfigurationError";
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new AuthenticationConfigurationError();
  }
  return secret;
}
