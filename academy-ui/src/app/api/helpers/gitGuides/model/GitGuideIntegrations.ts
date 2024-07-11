export interface GitGuideIntegrations {
  discordRoleIds: string[];
  // number of answers that should be correct in order to get discord score
  discordRolePassingCount?: number;
  discordWebhook?: string;
  projectGalaxyCredentialId?: string;
  projectGalaxyOatMintUrl?: string;
  projectGalaxyOatPassingCount?: number;
}
