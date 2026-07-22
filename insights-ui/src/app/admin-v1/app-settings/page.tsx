'use client';

import Stack from '@/components/ui/containers/Stack';
import Heading from '@/components/ui/Heading';
import StatusBadge, { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import type { AppSettingsForAdmin, ResolvedAppSetting } from '@/lib/appConfig/appConfig';
import { APP_CONFIG_GROUPS } from '@/lib/appConfig/appConfigDefinitions';
import { getAppSettingsForAdmin, updateAppSetting } from '@/utils/app-config-actions';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';

const SOURCE_BADGE: Record<ResolvedAppSetting['source'], { variant: StatusBadgeVariant; label: string }> = {
  ssm: { variant: 'success', label: 'SSM' },
  env: { variant: 'warning', label: 'Env var' },
  default: { variant: 'neutral', label: 'Default' },
};

function SettingRow({ setting, onSaved }: { setting: ResolvedAppSetting; onSaved: (saved: ResolvedAppSetting) => void }): JSX.Element {
  const { showNotification } = useNotificationContext();
  const isSecret = setting.secret === true;
  // Secrets are write-only: the field always starts empty and saving replaces the stored value.
  const [draft, setDraft] = useState<string>(isSecret ? '' : setting.value);
  const [saving, setSaving] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const dirty = isSecret ? draft !== '' : draft !== setting.value;

  // Note attached to the currently-selected dropdown option (e.g. the config a
  // value applies) — kept visible inline so a value's effect is never missed
  // while choosing/updating it.
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
    <>
      <tr className="border-t border-border align-top">
        <td className="py-2 pr-3">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              title="Show details"
              aria-expanded={showDetails}
              className="mt-0.5 text-muted hover:text-body"
            >
              <InformationCircleIcon className="h-4 w-4" />
            </button>
            <div>
              <Text as="div" size="sm" weight="medium" tone="body">
                {setting.label}
              </Text>
              <Text as="div" size="xs" tone="muted" className="font-mono">
                {setting.key}
              </Text>
            </div>
          </div>
        </td>

        <td className="w-[22rem] py-2 pr-3">
          {setting.type === 'boolean' ? (
            <ToggleWithIcon label={setting.label} enabled={draft === 'true'} setEnabled={(v) => setDraft(v ? 'true' : 'false')} />
          ) : setting.options ? (
            <>
              <StyledSelect
                label=""
                selectedItemId={draft}
                setSelectedItemId={(id) => setDraft(id ?? '')}
                items={setting.options.map((opt) => ({ id: opt.value, label: opt.label }))}
              />
              {selectedOptionNote && (
                <Text as="div" size="xs" tone="muted" className="mt-1 whitespace-pre-wrap rounded-md border border-border p-2 font-mono">
                  {selectedOptionNote}
                </Text>
              )}
            </>
          ) : (
            <Input
              modelValue={draft}
              onUpdate={(v) => setDraft(v === undefined ? '' : String(v))}
              required={false}
              password={isSecret}
              placeholder={isSecret ? (setting.isSet ? 'Enter a new value to replace the current secret' : 'Enter a value') : undefined}
            />
          )}
        </td>

        <td className="py-2 pr-3">
          <div className="flex flex-wrap gap-1.5">
            {isSecret && <StatusBadge variant={setting.isSet ? 'success' : 'neutral'} label={setting.isSet ? 'Secret · set' : 'Secret · not set'} />}
            {setting.isSet && <StatusBadge variant={source.variant} label={source.label} />}
          </div>
        </td>

        <td className="py-2 text-right">
          <IconButton
            iconName={IconTypes.ArrowDownTrayIcon}
            tooltip={dirty ? 'Save' : 'No changes to save'}
            primary
            removeBorder
            disabled={!dirty || saving}
            loading={saving}
            onClick={handleSave}
          />
        </td>
      </tr>

      {showDetails && (
        <tr>
          <td colSpan={4} className="pb-3 pl-8 pr-3">
            <Text as="p" size="sm" tone="muted">
              {setting.description}
            </Text>
            {setting.options && (
              <div className="mt-2 space-y-1.5">
                {setting.options.map((opt) => (
                  <div key={opt.value}>
                    <Text as="span" size="xs" weight="medium" tone="body" className="font-mono">
                      {opt.label}
                    </Text>
                    {opt.helpNote && (
                      <Text as="div" size="xs" tone="muted" className="whitespace-pre-wrap font-mono">
                        {opt.helpNote}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
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
    <Stack gap="lg">
      <div className="border-b border-border pb-3">
        <Heading as="h1" size="2xl" weight="semibold" tone="white">
          App Settings
        </Heading>
        <Text as="p" size="sm" tone="muted" className="mt-1">
          Runtime configuration stored in AWS SSM Parameter Store. Values resolve in order: SSM &rarr; legacy environment variable &rarr; bundled default, so
          the app keeps working even when SSM is not configured. Click the <InformationCircleIcon className="inline h-4 w-4 align-text-bottom" /> on any row for
          details.
        </Text>
      </div>

      {data && !data.ssmConfigured && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
          <Text as="p" size="sm" tone="body">
            SSM Parameter Store is not configured on this server. Settings below are read-only (from environment variables or bundled defaults). To enable
            editing, set <span className="font-mono">APP_CONFIG_SSM_ENABLED=true</span> and grant the server SSM permissions.
          </Text>
        </div>
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
              <Heading as="h2" size="md" weight="semibold" tone="white">
                {group.label}
              </Heading>
              <Text as="p" size="xs" tone="muted" className="mb-2 mt-0.5">
                {group.description}
              </Text>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody>
                    {groupSettings.map((setting) => (
                      <SettingRow key={setting.key} setting={setting} onSaved={handleSaved} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
    </Stack>
  );
}
