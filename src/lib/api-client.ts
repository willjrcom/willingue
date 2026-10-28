/**
 * Read JSON API responses without exposing a raw JSON parser exception to users.
 * A reverse proxy or unhandled server error can return an empty or HTML body.
 */
export async function readApiJson<T extends object>(response: Response): Promise<T> {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(`O servidor não respondeu corretamente (HTTP ${response.status}). Verifique os logs do Dokploy.`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error(`O servidor retornou uma resposta inválida (HTTP ${response.status}). Verifique os logs do Dokploy.`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("O servidor retornou dados inesperados. Tente novamente.");
  }
  return parsed as T;
}
