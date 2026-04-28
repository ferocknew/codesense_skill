import { DEFAULT_EMBEDDING_CONFIG, EmbeddingConfig } from "./types";

export class OllamaEmbedder {
  private config: EmbeddingConfig;

  constructor(config?: Partial<EmbeddingConfig>) {
    this.config = { ...DEFAULT_EMBEDDING_CONFIG, ...config };
  }

  async checkHealth(): Promise<{
    ok: boolean;
    modelAvailable: boolean;
    error?: string;
  }> {
    try {
      const resp = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!resp.ok) {
        return { ok: false, modelAvailable: false, error: `HTTP ${resp.status}` };
      }
      const data = (await resp.json()) as { models: { name: string }[] };
      const modelAvailable = data.models.some(
        (m) => m.name === this.config.model || m.name.startsWith(this.config.model + ":")
      );
      return { ok: true, modelAvailable, error: modelAvailable ? undefined : `模型 ${this.config.model} 未找到` };
    } catch (e: any) {
      return {
        ok: false,
        modelAvailable: false,
        error: `Ollama 不可用 (${this.config.baseUrl}): ${e.message}。请确认 Ollama 正在运行。`,
      };
    }
  }

  async ensureModel(): Promise<void> {
    const health = await this.checkHealth();
    if (!health.ok) {
      console.error(`错误: ${health.error}`);
      console.error("请先安装并启动 Ollama: https://ollama.com");
      process.exit(1);
    }
    if (!health.modelAvailable) {
      console.error(`错误: 模型 ${this.config.model} 未找到`);
      console.error(`请运行: ollama pull ${this.config.model}`);
      process.exit(1);
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const results: number[][] = [];
    const batchSize = 32;
    const totalBatches = Math.ceil(texts.length / batchSize);
    const barWidth = 20;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      if (totalBatches > 1) {
        const pct = Math.round((batchNum / totalBatches) * 100);
        const filled = Math.round(barWidth * batchNum / totalBatches);
        const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);
        process.stderr.write(`\r  Embedding [${bar}] ${pct}% (${batchNum}/${totalBatches})`);
      }

      const resp = await fetch(`${this.config.baseUrl}/api/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.config.model, input: batch }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Ollama embed API 错误 (HTTP ${resp.status}): ${errText}`);
      }

      const data = (await resp.json()) as { embeddings: number[][] };
      if (!data.embeddings || data.embeddings.length !== batch.length) {
        throw new Error(`Ollama 返回的 embeddings 数量不匹配: 期望 ${batch.length}, 实际 ${data.embeddings?.length}`);
      }

      // MRL 截断: API 返回 dimensionsFull 维，截断到目标维度
      const truncated = data.embeddings.map((e) => e.slice(0, this.config.dimensions));
      results.push(...truncated);
    }

    if (totalBatches > 1) {
      process.stderr.write("\n");
    }

    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const results = await this.embed([text]);
    return results[0];
  }

  getConfig(): Readonly<EmbeddingConfig> {
    return { ...this.config };
  }
}
