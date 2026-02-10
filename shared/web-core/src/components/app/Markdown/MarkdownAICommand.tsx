import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { ICommand, TextAreaTextApi, TextState } from '@uiw/react-md-editor';
import { getBreaksNeededForEmptyLineAfter, getBreaksNeededForEmptyLineBefore, selectWord } from '@uiw/react-md-editor';
import React from 'react';

export const markdownAIRewriteCommandFactory: (rewriteText: (text: string) => Promise<string>) => ICommand = (
  rewriteText: (text: string) => Promise<string>
): ICommand => ({
  name: 'markdownAICommand',
  keyCommand: 'markdownAICommand',

  icon: <ArrowPathRoundedSquareIcon />,
  buttonProps: { 'aria-label': 'Insert Code Block (ctrl + shift + j)', title: 'Insert Code Block (ctrl + shift +j)' },
  execute: async (tate: TextState, api: TextAreaTextApi) => {
    // Adjust the selection to encompass the whole word if the caret is inside one
    const newSelectionRange = selectWord({ text: tate.text, selection: tate.selection });
    const state1 = api.setSelectionRange(newSelectionRange);

    const breaksBeforeCount = getBreaksNeededForEmptyLineBefore(state1.text, state1.selection.start);
    const breaksBefore = Array(breaksBeforeCount + 1).join('\n');

    const breaksAfterCount = getBreaksNeededForEmptyLineAfter(state1.text, state1.selection.end);
    const breaksAfter = Array(breaksAfterCount + 1).join('\n');

    const selectedText = state1.selectedText;

    console.log('selectedText', selectedText);
    if (selectedText.length < 100) {
      return;
    }

    const newText = await rewriteText(selectedText);

    api.replaceSelection(`${breaksBefore}\n\n---- before ----\n\n\n${selectedText}\n\n--- after ---\n\n${newText}\n\n\n${breaksAfter}`);

    const selectionStart = state1.selection.start + breaksBeforeCount + 4;
    const selectionEnd = selectionStart + selectedText.length;

    api.setSelectionRange({
      start: selectionStart,
      end: selectionEnd,
    });
  },
});
