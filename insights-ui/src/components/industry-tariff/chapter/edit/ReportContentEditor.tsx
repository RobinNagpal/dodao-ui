'use client';

import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { Card, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/Heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Stack from '@/components/ui/containers/Stack';
import Button from '@dodao/web-core/components/core/buttons/Button';

export type ContentValue = string | ContentValue[] | { [key: string]: ContentValue };

// Derived/system keys that admins shouldn't edit by hand (countryNames is rebuilt on save).
const HIDDEN_KEYS = new Set(['countryNames', 'lastUpdated']);
// Short, single-line string fields get a plain input; everything else is markdown.
const SINGLE_LINE_KEY = /(title|name|classification|dutyDelta)$/i;

function humanize(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Same shape as `value` with every string blanked — used as the template for a new array item.
function emptyLike(value: ContentValue): ContentValue {
  if (typeof value === 'string') return '';
  if (Array.isArray(value)) return value.length ? [emptyLike(value[0])] : [];
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, emptyLike(v)]));
}

interface ReportContentEditorProps {
  name: string;
  value: ContentValue;
  onChange: (value: ContentValue) => void;
  // Unique dotted path, used as the editor id.
  path: string;
}

// Renders an editor for any report JSON value: strings → markdown / text input, objects → their
// fields, arrays → repeatable items with add/remove. Field labels come from the JSON keys, so every
// report section shares this one editor.
export default function ReportContentEditor({ name, value, onChange, path }: ReportContentEditorProps): JSX.Element | null {
  const label = humanize(name);

  if (typeof value === 'string') {
    if (SINGLE_LINE_KEY.test(name)) {
      return (
        <Stack gap="xs">
          <Label htmlFor={path}>{label}</Label>
          <Input id={path} value={value} onChange={(e) => onChange(e.target.value)} />
        </Stack>
      );
    }
    return <MarkdownEditor id={path} objectId={path} label={label} modelValue={value} onUpdate={onChange} maxHeight={220} />;
  }

  if (Array.isArray(value)) {
    const template = value.length ? emptyLike(value[0]) : null;
    return (
      <Stack gap="md">
        <Heading as="h3" size="md">
          {label}
        </Heading>
        {value.map((item, index) => (
          <Card key={index}>
            <CardContent>
              <Stack gap="md">
                <Stack direction="row" justify="between" align="center">
                  <Heading as="h4" size="sm" tone="muted">
                    {label} #{index + 1}
                  </Heading>
                  <Button variant="text" size="sm" onClick={() => onChange(value.filter((_, i) => i !== index))}>
                    Remove
                  </Button>
                </Stack>
                <ReportContentEditor
                  name={name}
                  value={item}
                  path={`${path}.${index}`}
                  onChange={(next) => onChange(value.map((v, i) => (i === index ? next : v)))}
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
        {template !== null && (
          <Stack direction="row">
            <Button variant="outlined" size="sm" onClick={() => onChange([...value, template])}>
              Add {label}
            </Button>
          </Stack>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {Object.entries(value)
        .filter(([key]) => !HIDDEN_KEYS.has(key))
        .map(([key, child]) => (
          <ReportContentEditor key={key} name={key} value={child} path={`${path}.${key}`} onChange={(next) => onChange({ ...value, [key]: next })} />
        ))}
    </Stack>
  );
}
