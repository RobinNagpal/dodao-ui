import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';
import ReactJson from 'react-json-view';

export interface ViewCriteriaModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sampleJson: string;
  onSave: (sampleJson: string) => void;
}

export default function SampleJsonEditModal({ open, onClose, title, sampleJson: jsonObjString, onSave }: ViewCriteriaModalProps) {
  const [sampleJson, setSampleJson] = React.useState<object | null>(jsonObjString ? JSON.parse(jsonObjString) : {});
  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <ReactJson
        src={sampleJson || {}}
        theme="monokai"
        style={{ textAlign: 'left', height: '75vh' }}
        onEdit={(edit) => {
          setSampleJson(edit.updated_src);
        }}
        onAdd={(add) => {
          setSampleJson(add.updated_src);
        }}
        onDelete={(del) => {
          setSampleJson(del.updated_src);
        }}
        enableClipboard={true}
      />

      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
        <Button onClick={() => onSave(JSON.stringify(sampleJson, null, 2))} primary variant="contained">
          Save
        </Button>
      </div>
    </FullPageModal>
  );
}
