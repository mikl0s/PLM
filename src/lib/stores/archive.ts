import { writable } from 'svelte/store';

interface ArchivedItem {
  id: string;
  libraryId: string;
  title: string;
  archivedAt: Date;
}

function createArchiveStore() {
  // Load archived items from localStorage
  const storedItems = localStorage.getItem('archived_items');
  const initialItems: ArchivedItem[] = storedItems ? JSON.parse(storedItems) : [];

  const { subscribe, update } = writable<ArchivedItem[]>(initialItems);

  return {
    subscribe,
    archive: (libraryId: string, id: string, title: string) => {
      update((items) => {
        const newItems = [...items, { id, libraryId, title, archivedAt: new Date() }];
        localStorage.setItem('archived_items', JSON.stringify(newItems));
        return newItems;
      });
    },
    unarchive: (id: string) => {
      update((items) => {
        const newItems = items.filter((item) => item.id !== id);
        localStorage.setItem('archived_items', JSON.stringify(newItems));
        return newItems;
      });
    },
    isArchived: (id: string) => {
      const items = JSON.parse(localStorage.getItem('archived_items') || '[]');
      return items.some((item: ArchivedItem) => item.id === id);
    },
  };
}

export const archive = createArchiveStore();
