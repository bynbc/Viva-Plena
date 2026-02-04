
export const hashPassword = (password: string): string => {
  // Simple deterministic hash for demo purposes
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `viva_hash_${hash}`;
};
