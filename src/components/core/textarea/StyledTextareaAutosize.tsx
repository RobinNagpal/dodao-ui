import UnstyledTextareaAutosize, { TextareaAutosizeProps } from '@/components/core/textarea/UnstyledTextareaAutosize';
import { useCallback, useEffect, useState } from 'react';

export default function StyledTextareaAutosize(props: TextareaAutosizeProps) {
  return (
    <div className="border md:rounded-lg bg-skin-block-bg">
      <UnstyledTextareaAutosize {...props} />
    </div>
  );
}
