import { useContext } from 'react';

import { FolderInterface } from '@/chatbot/types/folder';

import HomeContext from '@/chatbot/home/home.context';

import Folder from '@/chatbot/components/Folder';
import { PromptComponent } from '@/chatbot/components/Promptbar/components/Prompt';

import PromptbarContext from '@/chatbot/components/Promptbar/PromptBar.context';

export const PromptFolders = () => {
  const {
    state: { folders },
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredPrompts },
    handleUpdatePrompt,
  } = useContext(PromptbarContext);

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData('prompt'));

      const updatedPrompt = {
        ...prompt,
        folderId: folder.id,
      };

      handleUpdatePrompt(updatedPrompt);
    }
  };

  const PromptFolders = (currentFolder: FolderInterface) =>
    filteredPrompts
      .filter((p) => p.folderId)
      .map((prompt, index) => {
        if (prompt.folderId === currentFolder.id) {
          return (
            <div key={index} className="ml-5 gap-2 border-l pl-2">
              <PromptComponent prompt={prompt} />
            </div>
          );
        }
      });

  return (
    <div className="flex w-full flex-col pt-2">
      {folders
        .filter((folder) => folder.type === 'prompt')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder key={index} searchTerm={searchTerm} currentFolder={folder} handleDrop={handleDrop} folderComponent={PromptFolders(folder)} />
        ))}
    </div>
  );
};
