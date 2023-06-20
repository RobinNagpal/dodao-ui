import BadgeWithRemove from '@/components/core/badge/BadgeWithRemove';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import { useState } from 'react';

export interface Badges {
  id: string;
  label: string;
}

export interface UpsertBadgeItemsProps {
  badges: Badges[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
}

export default function UpsertBadgeInput(props: UpsertBadgeItemsProps) {
  const [domain, setDomain] = useState<string>('');
  return (
    <div>
      <div className="flex w-full items-end mb-2">
        <Input label="Domains" onUpdate={(v) => setDomain(v?.toString() || '')} modelValue={domain} className="grow" />
        <Button
          onClick={() => {
            props.onAdd(domain);
            setDomain('');
          }}
          className="ml-2 grow-0 w-16"
          variant="contained"
          primary
        >
          Add
        </Button>
      </div>

      {props.badges.map((badge) => (
        <BadgeWithRemove key={badge.id} id={badge.id} label={badge.label} onRemove={props.onRemove} />
      ))}
    </div>
  );
}
