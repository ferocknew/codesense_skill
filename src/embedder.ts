// stub: Phase 1 实现
export class OllamaEmbedder {
  async checkHealth() {
    return { ok: false, modelAvailable: false, error: "not implemented" };
  }
  async embedQuery(_text: string): Promise<number[]> {
    return [];
  }
}
