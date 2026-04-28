export interface ProjectIndexState {
  name: string;
  path: string;
  status: "idle" | "indexing" | "completed" | "failed";
  lastIndexAt: string | null;
  lastDurationMs: number | null;
  lastChanges: { added: number; modified: number; deleted: number } | null;
  error: string | null;
}

export interface ServerState {
  startedAt: string;
  port: number;
  projects: Record<string, ProjectIndexState>;
}

export function createServerState(port: number): ServerState {
  return {
    startedAt: new Date().toISOString(),
    port,
    projects: {},
  };
}

export function initProjectState(
  state: ServerState,
  name: string,
  projectPath: string
): void {
  if (!state.projects[name]) {
    state.projects[name] = {
      name,
      path: projectPath,
      status: "idle",
      lastIndexAt: null,
      lastDurationMs: null,
      lastChanges: null,
      error: null,
    };
  }
}

export function updateProjectState(
  state: ServerState,
  name: string,
  update: Partial<ProjectIndexState>
): void {
  if (state.projects[name]) {
    Object.assign(state.projects[name], update);
  }
}

export function getSerializedState(state: ServerState): object {
  const uptimeMs = Date.now() - new Date(state.startedAt).getTime();
  return {
    startedAt: state.startedAt,
    uptimeMs,
    port: state.port,
    projects: Object.values(state.projects).map((p) => ({ ...p })),
  };
}
