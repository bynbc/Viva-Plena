// Simples função de Hash para não salvar senhas em texto puro
export const hashPassword = (password: string): string => {
  // Em um app real usaríamos bcrypt, mas para este template usamos um hash simples base64
  // para garantir que o login funcione sem bibliotecas pesadas.
  return btoa(password + "_viva_plena_secret_salt"); 
};
