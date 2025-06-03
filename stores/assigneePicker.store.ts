// stores/assigneePickerStore.ts
import { create } from 'zustand';

interface AssigneePickerStore {
    memberIds: string[];
    onSelectAssignees?: (ids: string[]) => void;
    initialSelected?: string[];
    setPicker: (memberIds: string[], fn: (ids: string[]) => void, initial: string[]) => void;
    reset: () => void;
}

export const useAssigneePickerStore = create<AssigneePickerStore>((set) => ({
    memberIds: [],
    onSelectAssignees: undefined,
    initialSelected: [],
    setPicker: (memberIds, fn, initial) => set({ memberIds: memberIds, onSelectAssignees: fn, initialSelected: initial }),
    reset: () => set({ memberIds: [], onSelectAssignees: undefined, initialSelected: [] }),
}));
