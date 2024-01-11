import BadgeWithRemove from '@/components/core/badge/BadgeWithRemove';
import KeyValueBadgeWithRemove, { KeyValueBadge } from '@/components/core/badge/KeyValueBadgeWithRemove';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import { InputWithButton } from '@/components/core/input/InputWithButton';
import React, { FormEvent, useState } from 'react';

export interface UpsertBadgeItemsProps {
  label: string;
  badges: KeyValueBadge[];
  labelFn: (badge: KeyValueBadge) => string;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export default function UpsertKeyValueBadgeInput(props: UpsertBadgeItemsProps) {
  const [inputText, setInputText] = useState<string>('');

  function addBadge(e?: FormEvent<HTMLFormElement>) {
    props.onAdd(inputText);
    setInputText('');
    e?.preventDefault();
    return false;
  }

  return (
    <form className={`${props.className ? props.className : ' '}`} onSubmit={addBadge}>
      <div className="flex w-full items-end mb-2">
        <InputWithButton
          buttonLabel={'Add'}
          inputLabel={props.label}
          onButtonClick={addBadge}
          onInputUpdate={(e) => {
            setInputText(e?.toString() || '');
          }}
          inputModelValue={inputText}
        />
      </div>

      {props.badges.map((badge) => (
        <KeyValueBadgeWithRemove key={badge.key} badge={badge} labelFn={props.labelFn} onRemove={props.onRemove} />
      ))}
    </form>
  );
}
