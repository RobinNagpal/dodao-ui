import KeyValueBadgeWithRemove, { KeyValueBadge } from '@dodao/web-core/components/core/badge/KeyValueBadgeWithRemove';
import { InputWithButton } from '@dodao/web-core/components/core/input/InputWithButton';
import React, { FormEvent, useState } from 'react';

export interface UpsertBadgeItemsProps {
  label: string;
  badges: KeyValueBadge[];
  labelFn: (badge: KeyValueBadge) => string;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  className?: string;
  helpText?: string;
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
      {props.helpText && <p className="ml-1 mt-2 mb-2 text-sm">{props.helpText}</p>}
      {props.badges.map((badge) => (
        <KeyValueBadgeWithRemove key={badge.key} badge={badge} labelFn={props.labelFn} onRemove={props.onRemove} />
      ))}
    </form>
  );
}
