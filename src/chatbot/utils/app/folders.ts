import { FolderInterface } from '@/chatbot/types/folder';

export const saveFolders = (folders: FolderInterface[]) => {
  localStorage.setItem('folders', JSON.stringify(folders));
};
