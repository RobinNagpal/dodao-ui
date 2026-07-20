'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import type { AppSettingsForAdmin, ResolvedAppSetting } from '@/lib/appConfig/appConfig';
import { getAppSettingsForAdmin, updateAppSetting } from '@/utils/app-config-actions';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useEffect, useState } from 'react';

const SOURCE_LABELS: Record<ResolvedAppSetting['source'], { text: string; className: string }> = {
  ssm: { text: 'SSM', className: 'border-emerald-700/40 bg-emerald-900/30 text-emerald-200' },
  env: { text: 'Env var', className: 'border-amber-700/40 bg-amber-900/30 text-amber-200' },
  default: { text: 'Default', className: 'border-gray-600/50 bg-gray-700/40 text-gray-300' },
};

function SourceBadge({ source }: { source: ResolvedAppSetting['source'] }): JSX.Element {
  const { text, className } = SOURCE_LABELS[source];
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{text}</span>;
}

function SettingRow({ setting, onSaved }: { setting: ResolvedAppSetting; onSaved: (saved: ResolvedAppSetting) => void }): JSX.Element {
  const { showNotification } = useNotificationContext();
  const [draft, setDraft] = useState<string>(setting.value);
  const [saving, setSaving] = useState<boolean>(false);

  const dirty = draft !== setting.value;

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const res = await updateAppSetting(setting.key, draft);
      if (res.success) {
        showNotification({ type: 'success', message: res.message });
        onSaved({ ...setting, value: draft, source: 'ssm' });
      } else {
        showNotification({ type: 'error', message: res.message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showNotification({ type: 'error', message: `Failed to save: ${message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-white">{setting.label}</p>
          <p className="font-mono text-xs text-gray-400 mt-0.5">{setting.key}</p>
        </div>
        <SourceBadge source={setting.source} />
      </div>

      <p className="text-sm text-gray-300">{setting.description}</p>

      {setting.type === 'boolean' ? (
        <ToggleWithIcon label={setting.label} enabled={draft === 'true'} setEnabled={(v) => setDraft(v ? 'true' : 'false')} />
      ) : (
        <Input modelValue={draft} onUpdate={(v) => setDraft(v === undefined ? '' : String(v))} required={false} />
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} disabled={saving || !dirty}>
          Save
        </Button>
      </div>
    </div>
  );
}

export default function AppSettingsPage(): JSX.Element {
  const { showNotification } = useNotificationContext();
  const [data, setData] = useState<AppSettingsForAdmin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    getAppSettingsForAdmin()
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        showNotification({ type: 'error', message: `Failed to load settings: ${message}` });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showNotification]);

  const handleSaved = (saved: ResolvedAppSetting): void => {
    setData((prev) => (prev ? { ...prev, settings: prev.settings.map((s) => (s.key === saved.key ? saved : s)) } : prev));
  };

  return (
    <PageWrapper>
      <AdminNav />

      <div className="bg-gray-800 -mx-6 px-6 py-6 mb-6 border-b border-gray-700/60">
        <h1 className="text-2xl font-semibold text-white">App Settings</h1>
        <p className="text-gray-300 mt-1">
          Runtime configuration stored in AWS SSM Parameter Store. Values resolve in order: SSM &rarr; legacy environment variable &rarr; bundled default, so
          the app keeps working even when SSM is not configured.
        </p>
      </div>

      {data && !data.ssmConfigured && (
        <div className="mb-6 rounded-lg border border-amber-700/40 bg-amber-900/30 p-4 text-amber-200">
          SSM Parameter Store is not configured on this server. Settings below are read-only (from environment variables or bundled defaults). To enable
          editing, set <span className="font-mono">APP_CONFIG_SSM_ENABLED=true</span> and grant the server SSM permissions.
        </div>
      )}

      {loading && <p className="text-gray-300">Loading settings…</p>}

      {data && (
        <div className="space-y-4">
          {data.settings.map((setting) => (
            <SettingRow key={setting.key} setting={setting} onSaved={handleSaved} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
