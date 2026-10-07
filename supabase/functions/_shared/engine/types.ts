export type PlayerId = string;

export interface GameDefinition<PublicState, PrivateState, SecretState, Action, Settings> {
  id: string;
  minPlayers: number;
  maxPlayers: number;
  defaultSettings: Settings;
  
  setup(ctx: SetupCtx<Settings>): FullState<PublicState, PrivateState, SecretState>;
  reduce(state: FullState<PublicState, PrivateState, SecretState>, action: Action, ctx: ActionCtx): FullState<PublicState, PrivateState, SecretState> | { error: string };
}

export interface SetupCtx<Settings> {
  players: PlayerId[];
  settings: Settings;
  seed: string;
}

export interface ActionCtx {
  actorId: PlayerId;
  timestamp: number;
}

export interface FullState<PublicState, PrivateState, SecretState> {
  publicState: PublicState;
  privateState: Record<PlayerId, PrivateState>;
  secretState: SecretState;
}
