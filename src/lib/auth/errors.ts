/**
 * Traducción de errores de Supabase Auth a mensajes accionables en español.
 *
 * Módulo puro: sin red, sin estado y sin dependencias de servidor. Se prueba de
 * forma aislada y se usa tanto en el cliente como en formularios.
 */
export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirma tu correo antes de entrar. Revisa tu bandeja y la carpeta de spam.";
  }
  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return "Ya existe una cuenta con ese correo. Inicia sesión o recupera tu acceso.";
  }
  if (normalized.includes("password should be at least")) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (normalized.includes("unable to validate email") || normalized.includes("invalid email")) {
    return "Escribe un correo válido.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.";
  }
  if (normalized.includes("signup is disabled")) {
    return "El registro está cerrado temporalmente.";
  }
  return "No pudimos completar la operación. Inténtalo de nuevo.";
}
