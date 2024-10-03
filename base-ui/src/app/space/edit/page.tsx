'use client';
import { CssTheme, themes, ThemeKey } from '@dodao/web-core/src/components/app/themes';
import UpsertBadgeInput from '@dodao/web-core/components/core/badge/UpsertBadgeInput';
import UpsertKeyValueBadgeInput from '@dodao/web-core/components/core/badge/UpsertKeyValueBadgeInput';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import Checkboxes from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import { LoginProviders } from '@dodao/web-core/types/deprecated/models/enums';
import useEditSpace from '@/components/spaces/useEditSpace';
import union from 'lodash/union';
import { ThemeColors } from '@dodao/web-core/types/space';
import React, { useState, CSSProperties, useEffect } from 'react';

type ThemeColorsKeys = 'bgColor' | 'blockBg' | 'borderColor' | 'headingColor' | 'linkColor' | 'primaryColor' | 'textColor';

const ColorLabels: Record<ThemeColorsKeys, string> = {
  primaryColor: 'Primary Color',
  bgColor: 'Background Color',
  textColor: 'Text Color',
  linkColor: 'Link Color',
  headingColor: 'Heading Color',
  borderColor: 'Border Color',
  blockBg: 'Block Background Color',
};

export default function UpsertSpaceBasicSettings() {
  const editSpaceHelper = useEditSpace();

  const { space, setSpaceField, setAuthSettingsField, upsertSpace, initialize, upserting } = editSpaceHelper;
  const theme: ThemeKey = CssTheme.GlobalTheme;
  const [themeColors, setThemeColors] = useState<ThemeColors>(space?.themeColors || themes[theme]);

  const themeStyles = {
    '--primary-color': themeColors.primaryColor,
    '--bg-color': themeColors.bgColor,
    '--text-color': themeColors.textColor,
    '--link-color': themeColors.linkColor,
    '--heading-color': themeColors.headingColor,
    '--border-color': themeColors.borderColor,
    '--block-bg': themeColors.blockBg,
  } as CSSProperties;

  useEffect(() => {
    initialize();
  }, []);

  const handleColorChange = (colorKey: ThemeColorsKeys, colorValue: string) => {
    setThemeColors({ ...themeColors, [colorKey]: colorValue });
    setSpaceField('themeColors', { ...themeColors, [colorKey]: colorValue });
  };

  return (
    <div className="p-6">
      <div className="space-y-12 text-left p-6">
        <div className="border-b pb-12">
          <h2 className="font-semibold leading-7 text-3xl">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <Input label="Id" modelValue={space?.id} onUpdate={(value) => setSpaceField('id', value?.toString() || '')} disabled />
          <Input label="Name" modelValue={space?.name} onUpdate={(value) => setSpaceField('name', value?.toString() || '')} />
          <Input label="Creator" modelValue={space?.creator} onUpdate={(value) => setSpaceField('creator', value?.toString() || '')} />

          <UpsertBadgeInput
            label={'Domains'}
            badges={space.domains.map((d) => ({ id: d, label: d }))}
            onAdd={(d) => {
              setSpaceField('domains', union(space.domains, [d]));
            }}
            onRemove={(d) => {
              setSpaceField(
                'domains',
                space?.domains.filter((domain) => domain !== d)
              );
            }}
          />
          <UpsertKeyValueBadgeInput
            label={'Admins By Usernames & Names'}
            badges={space.adminUsernamesV1.map((d) => ({ key: d.username, value: d.nameOfTheUser }))}
            onAdd={(admin) => {
              const string = admin.split(',');
              const username = string[0].trim();
              const nameOfTheUser = string.length > 1 ? string[1].trim() : '';
              const newAdmin = { username, nameOfTheUser };
              setSpaceField('adminUsernamesV1', union(space.adminUsernamesV1, [newAdmin]));
            }}
            labelFn={(badge) => `${badge.key} - ${badge.value}`}
            onRemove={(d) => {
              setSpaceField(
                'adminUsernamesV1',
                space.adminUsernamesV1.filter((domain) => domain.username !== d)
              );
            }}
          />
        </div>
      </div>

      <div className="space-y-12 text-left p-4">
        <h1 className="font-bold text-2xl mb-4">Auth Details</h1>
        <div className="border-b pb-12">
          <ToggleWithIcon
            label={'Enable login'}
            enabled={!!space.authSettings.enableLogin}
            setEnabled={(value) => setAuthSettingsField('enableLogin', value)}
          />

          <Checkboxes
            label={'Login Options'}
            items={Object.keys(LoginProviders).map((key) => ({ id: key, label: key, name: key }))}
            onChange={(options) => setAuthSettingsField('loginOptions', options)}
            selectedItemIds={space.authSettings.loginOptions ? space.authSettings.loginOptions : Object.keys(LoginProviders)}
            className="mt-6"
          />
        </div>
      </div>

      <div style={{ ...themeStyles }}>
        <div className="mt-4">
          <div className="flex flex-col md:flex-row flex-wrap">
            <div className="w-full md:w-1/2 mt-4">
              <h1 className="font-bold text-2xl mb-4">Theme Details</h1>
              {Object.entries(ColorLabels).map((e) => {
                const [colorKey, label] = e as [ThemeColorsKeys, string];
                const colorValue = themeColors[colorKey];
                return (
                  <div key={colorKey} className="flex justify-between mb-2">
                    <label className="ml-7">{label}</label>
                    <div className="grid grid-cols-2	">
                      <input type="color" className="w-12 h-8 mr-8" value={colorValue} onChange={(e) => handleColorChange(colorKey, e.target.value)} />
                      <div>{colorValue}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex items-center justify-end gap-x-6">
        <Button
          variant="contained"
          primary
          loading={upserting}
          disabled={upserting}
          onClick={async () => {
            await upsertSpace();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
