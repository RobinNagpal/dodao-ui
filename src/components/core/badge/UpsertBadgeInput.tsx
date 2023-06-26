import BadgeWithRemove from '@/components/core/badge/BadgeWithRemove';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import { FormEvent, useState } from 'react';

export interface Badges {
  id: string;
  label: string;
}

export interface UpsertBadgeItemsProps {
  label: string;
  badges: Badges[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export default function UpsertBadgeInput(props: UpsertBadgeItemsProps) {
  const [newBadge, setNewBadge] = useState<string>('');

  function addBadge(e?: FormEvent<HTMLFormElement>) {
    props.onAdd(newBadge);
    setNewBadge('');
    e?.preventDefault();
    return false;
  }

  return (
    <form className={`${props.className ? props.className : ' '}`} onSubmit={addBadge} onSubmitCapture={addBadge}>
      <div className="flex w-full items-end mb-2">
        <Input label={props.label} onUpdate={(v) => setNewBadge(v?.toString() || '')} modelValue={newBadge} className="grow" />
        <Button onClick={addBadge} className="ml-2 grow-0 w-16" variant="contained" primary>
          Add
        </Button>
      </div>

      {props.badges.map((badge) => (
        <BadgeWithRemove key={badge.id} id={badge.id} label={badge.label} onRemove={props.onRemove} />
      ))}
    </form>
  );
}
