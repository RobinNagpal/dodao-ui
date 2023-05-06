export interface GnosisSafeWallet {
  id: string;
  address: string;
  chainId: string;
  name: string;
  order: number;
}

export interface SpaceGitRepository {
  gitRepoType?: string;
  authenticationToken?: string;
  repoUrl: string;
}

export interface SpaceIntegrationModel {
  id: string;
  spaceId: string;
  academyRepository?: string;
  discordGuildId?: string;
  gitGuideRepositories: SpaceGitRepository[];
  gnosisSafeWallets?: GnosisSafeWallet[];
  projectGalaxyToken?: string;
  projectGalaxyTokenLastFour?: string;
}
