const DEFAULT_PORT = 54321;

export async function notifyServer(
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const port = parseInt(process.env.CODESENSE_PORT || String(DEFAULT_PORT), 10);
  try {
    await fetch(`http://localhost:${port}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // 服务器未运行，静默忽略
  }
}
