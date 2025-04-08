// TransformationPatchEditModal.tsx
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import { Prisma } from '@prisma/client';

export interface TransformationPatchEditModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  transformationPatch: Prisma.JsonValue | null;
  onSave: (patch: Prisma.JsonValue) => void;
}

export default function TransformationPatchEditModal({ open, onClose, title, transformationPatch, onSave }: TransformationPatchEditModalProps) {
  // Initialize local state with the patch if provided; otherwise use an empty object.
  const [patch, setPatch] = useState<object>(transformationPatch && typeof transformationPatch === 'object' ? (transformationPatch as object) : []);

  const handleSave = () => {
    if (!patch) return;
    onSave(patch);
    onClose();
  };

  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <div className="overflow-auto">
        <ReactJson
          src={patch}
          theme="monokai"
          style={{ textAlign: 'left', height: '75vh' }}
          onEdit={(edit) => setPatch(edit.updated_src)}
          onAdd={(add) => setPatch(add.updated_src)}
          onDelete={(del) => setPatch(del.updated_src)}
          enableClipboard={true}
        />
      </div>

      <div className="flex justify-end mt-4 mx-4 pt-4 border-t border-gray-200">
        <Button onClick={handleSave} primary variant="contained">
          Save
        </Button>
      </div>
    </FullPageModal>
  );
}
