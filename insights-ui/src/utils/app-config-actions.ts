'use server';

import {
  AppSettingsForAdmin,
  getAppConfigBoolean,
  getResolvedAppSettings,
  isSsmConfigured,
  setAppConfigValue,
  UpdateAppSettingResult,
} from '@/lib/appConfig/appConfig';
import { isAdminServerSession } from '@/util/auth/isAdminServer';

/** Admin-only: list every managed setting with its resolved value and source. */
export async function getAppSettingsForAdmin(): Promise<AppSettingsForAdmin> {
  if (!(await isAdminServerSession())) {
    throw new Error('Not authorized');
  }
  return { ssmConfigured: isSsmConfigured(), settings: await getResolvedAppSettings() };
}

/** Admin-only: persist a single setting to SSM Parameter Store. */
export async function updateAppSetting(key: string, value: string): Promise<UpdateAppSettingResult> {
  if (!(await isAdminServerSession())) {
    return { success: false, message: 'Not authorized' };
  }
  return setAppConfigValue(key, value);
}

/** Public: whether users can currently buy credits via Stripe (admin kill switch in App Settings → Payments). */
export async function isStripeCreditPurchaseEnabled(): Promise<boolean> {
  return getAppConfigBoolean('STRIPE_CREDIT_PURCHASES_ENABLED');
}
