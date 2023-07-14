import Button from '@/components/core/buttons/Button';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import React from 'react';

export interface GenerateMarkdownContentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  selectGenerateNewContent: () => void;
  selectRewriteContent: () => void;
}
export default function SelectAIGeneratorModal(props: GenerateMarkdownContentModalProps) {
  return (
    <FullScreenModal open={props.open} onClose={props.onClose} title={props.title}>
      <div className="pt-4 flex flex-col justify-center items-center w-full h-max">
        <div className="p-4 mb-[100%] sm:mb-0">
          <Grid2Cols>
            <Button variant="outlined" primary className="p-2 w-full" onClick={props.selectGenerateNewContent}>
              Generate New Content
            </Button>
            <Button variant="contained" primary className="p-2 w-full" onClick={props.selectRewriteContent}>
              Rewrite Content
            </Button>
          </Grid2Cols>
        </div>
      </div>
    </FullScreenModal>
  );
}
