'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import Heading from '@/components/ui/Heading';
import StatusBadge, { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import type { AppSettingsForAdmin, ResolvedAppSetting } from '@/lib/appConfig/appConfig';
import { APP_CONFIG_GROUPS } from '@/lib/appConfig/appConfigDefinitions';
import { getAppSettingsForAdmin, updateAppSetting } from '@/utils/app-config-actions';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useEffect, useState } from 'react';

const SOURCE_BADGE: Record<ResolvedAppSetting['source'], { variant: StatusBadgeVariant; label: string }> = {
  ssm: { variant: 'success', label: 'SSM' },
  env: { variant: 'warning', label: 'Env var' },
  default: { variant: 'neutral', label: 'Default' },
};

function SettingCard({ setting, onSaved }: { setting: ResolvedAppSetting; onSaved: (saved: ResolvedAppSetting) => void }): JSX.Element {
  const { showNotification } = useNotificationContext();
  const isSecret = setting.secret === true;
  // Secrets are write-only: the field always starts empty and saving replaces the stored value.
  const [draft, setDraft] = useState<string>(isSecret ? '' : setting.value);
  const [saving, setSaving] = useState<boolean>(false);

  const dirty = isSecret ? draft !== '' : draft !== setting.value;

  // Note attached to the currently-selected dropdown option (e.g. the config a
  // value applies, as JSON or prose). Generic — shown for any option that has one.
  const selectedOptionNote = setting.options?.find((opt) => opt.value === draft)?.helpNote;

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const res = await updateAppSetting(setting.key, draft);
      if (res.success) {
        showNotification({ type: 'success', message: res.message });
        if (isSecret) {
          setDraft('');
          onSaved({ ...setting, value: '', isSet: true, source: 'ssm' });
        } else {
          onSaved({ ...setting, value: draft, isSet: draft.trim() !== '', source: 'ssm' });
        }
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

  const source = SOURCE_BADGE[setting.source];

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{setting.label}</CardTitle>
            <Text as="p" size="xs" tone="muted" className="font-mono mt-0.5">
              {setting.key}
            </Text>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {isSecret && <StatusBadge variant={setting.isSet ? 'success' : 'neutral'} label={setting.isSet ? 'Secret · set' : 'Secret · not set'} />}
            {setting.isSet && <StatusBadge variant={source.variant} label={source.label} />}
          </div>
        </div>
        <CardDescription>{setting.description}</CardDescription>
      </CardHeader>

      <CardContent>
        {setting.type === 'boolean' ? (
          <ToggleWithIcon label={setting.label} enabled={draft === 'true'} setEnabled={(v) => setDraft(v ? 'true' : 'false')} />
        ) : setting.options ? (
          <div>
            <StyledSelect
              label=""
              selectedItemId={draft}
              setSelectedItemId={(id) => setDraft(id ?? '')}
              items={setting.options.map((opt) => ({ id: opt.value, label: opt.label }))}
            />
            {selectedOptionNote && (
              <Text as="div" size="xs" tone="muted" className="mt-2 whitespace-pre-wrap rounded-md border border-border p-2 font-mono">
                {selectedOptionNote}
              </Text>
            )}
          </div>
        ) : (
          <Input
            modelValue={draft}
            onUpdate={(v) => setDraft(v === undefined ? '' : String(v))}
            required={false}
            password={isSecret}
            placeholder={isSecret ? (setting.isSet ? 'Enter a new value to replace the current secret' : 'Enter a value') : undefined}
          />
        )}
      </CardContent>

      <CardFooter className="mt-auto justify-end">
        <Button onClick={handleSave} loading={saving} disabled={saving || !dirty}>
          Save
        </Button>
      </CardFooter>
    </Card>
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
    <Stack gap="xl">
      <div className="border-b border-border pb-4">
        <Heading as="h1" size="2xl" weight="semibold" tone="white">
          App Settings
        </Heading>
        <Text as="p" size="sm" tone="muted" className="mt-1">
          Runtime configuration stored in AWS SSM Parameter Store. Values resolve in order: SSM &rarr; legacy environment variable &rarr; bundled default, so
          the app keeps working even when SSM is not configured.
        </Text>
      </div>

      {data && !data.ssmConfigured && (
        <Card className="gap-0 border-amber-500/40 bg-amber-500/10 py-4">
          <CardContent>
            <Text as="p" size="sm" tone="body">
              SSM Parameter Store is not configured on this server. Settings below are read-only (from environment variables or bundled defaults). To enable
              editing, set <span className="font-mono">APP_CONFIG_SSM_ENABLED=true</span> and grant the server SSM permissions.
            </Text>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Text as="p" tone="muted">
          Loading settings…
        </Text>
      )}

      {data &&
        APP_CONFIG_GROUPS.map((group) => {
          const groupSettings = data.settings.filter((s) => s.group === group.id);
          if (groupSettings.length === 0) return null;
          return (
            <section key={group.id}>
              <Heading as="h2" size="lg" weight="semibold" tone="white">
                {group.label}
              </Heading>
              <Text as="p" size="sm" tone="muted" className="mb-4 mt-1">
                {group.description}
              </Text>
              <MetricGrid columns="1-2-3" gap="lg">
                {groupSettings.map((setting) => (
                  <SettingCard key={setting.key} setting={setting} onSaved={handleSaved} />
                ))}
              </MetricGrid>
            </section>
          );
        })}
    </Stack>
  );
}
