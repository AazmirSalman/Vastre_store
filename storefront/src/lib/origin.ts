/** Rejects form posts that come from another website. Requests without an Origin header (server tools) pass. */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/** Reads a JSON body of at most `maxBytes`. Returns null if it is too large or not valid JSON. */
export async function readJson(req: Request, maxBytes = 20_000): Promise<Record<string, unknown> | null> {
  try {
    const text = await req.text()
    if (text.length > maxBytes) return null
    const data = JSON.parse(text)
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : null
  } catch {
    return null
  }
}
