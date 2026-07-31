'use server';

import { AppSettingsForAdmin, getResolvedAppSettings, isSsmConfigured, setAppConfigValue, UpdateAppSettingResult } from '@/lib/appConfig/appConfig';
import { isAdminServerSession } from '@/util/auth/isAdminServer';

/** Admin-only: list every managed setting with its resolved value and source. */
export async function getAppSettingsForAdmin(): Promise<AppSettingsForAdmin> {
  if (!(await isAdminServerSession())) {
    throw new Error('Not authorized');
  }
  // Force-refresh so admins see live SSM values despite the long app-config cache.
  return { ssmConfigured: isSsmConfigured(), settings: await getResolvedAppSettings({ forceRefresh: true }) };
}

/** Admin-only: persist a single setting to SSM Parameter Store. */
export async function updateAppSetting(key: string, value: string): Promise<UpdateAppSettingResult> {
  if (!(await isAdminServerSession())) {
    return { success: false, message: 'Not authorized' };
  }
  return setAppConfigValue(key, value);
}
