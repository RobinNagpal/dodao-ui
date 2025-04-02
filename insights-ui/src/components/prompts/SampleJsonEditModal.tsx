import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React, { useEffect } from 'react';
import ReactJson from 'react-json-view';

export interface ViewCriteriaModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sampleJson?: any;
}

export default function SampleJsonEditModal({ open, onClose, title, sampleJson: jsonObj }: ViewCriteriaModalProps) {
  const [sampleJson, setSampleJson] = React.useState<object | null>(jsonObj);
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
    </FullPageModal>
  );
}
