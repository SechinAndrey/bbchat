import { useDebounceFn } from "@vueuse/core";

export interface Draft {
  message: string;
  timestamp: number;
}

interface DraftStorage {
  saveDraft(key: string, draft: Draft): Promise<void>;
  getDraft(key: string): Promise<Draft | null>;
  deleteDraft(key: string): Promise<void>;
  clearOldDrafts(maxAge: number): Promise<void>;
}

class LocalStorageDraftStorage implements DraftStorage {
  private prefix = "draft_";

  async saveDraft(key: string, draft: Draft): Promise<void> {
    try {
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(draft));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }

  async getDraft(key: string): Promise<Draft | null> {
    try {
      const data = localStorage.getItem(`${this.prefix}${key}`);
      if (!data) return null;
      return JSON.parse(data) as Draft;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }

  async deleteDraft(key: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error("Failed to delete draft:", error);
    }
  }

  async clearOldDrafts(maxAge: number): Promise<void> {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            const draft = JSON.parse(data) as Draft;
            if (now - draft.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to clear old drafts:", error);
    }
  }
}

export function getDraftKey(
  entity: string,
  entityId: number,
  contactId: number,
): string {
  return `${entity}_${entityId}_${contactId}`;
}

export function useDrafts(storage?: DraftStorage) {
  const storageAdapter = storage || new LocalStorageDraftStorage();

  const saveDraft = useDebounceFn(async (key: string, draft: Draft) => {
    await storageAdapter.saveDraft(key, draft);
  }, 500);

  const loadDraft = async (key: string): Promise<Draft | null> => {
    return await storageAdapter.getDraft(key);
  };

  const clearDraft = async (key: string) => {
    await storageAdapter.deleteDraft(key);
  };

  const clearOldDrafts = async (maxAgeMs: number = 7 * 24 * 60 * 60 * 1000) => {
    await storageAdapter.clearOldDrafts(maxAgeMs);
  };

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    clearOldDrafts,
  };
}
