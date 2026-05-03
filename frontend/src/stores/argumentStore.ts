import { create } from 'zustand';
import { argumentApi } from '@/api/argumentApi';
import type { Argument, CreateArgumentRequest, VoteValue } from '@/types/argument';

interface ArgumentState {
  tree: Argument[];
  isLoading: boolean;

  fetchTree: (roomId: string) => Promise<void>;
  addArgument: (roomId: string, data: CreateArgumentRequest) => Promise<void>;
  vote: (argumentId: string, value: VoteValue) => Promise<void>;
  removeVote: (argumentId: string) => Promise<void>;
  deleteArgument: (argumentId: string) => Promise<void>;
}

function updateNodeInTree(
  nodes: Argument[],
  targetId: string,
  updater: (node: Argument) => Argument
): Argument[] {
  return nodes.map((node) => {
    if (node.id === targetId) return updater(node);
    if (node.children.length > 0) {
      return { ...node, children: updateNodeInTree(node.children, targetId, updater) };
    }
    return node;
  });
}

export const useArgumentStore = create<ArgumentState>((set, get) => ({
  tree: [],
  isLoading: false,

  fetchTree: async (roomId) => {
    set({ isLoading: true });
    try {
      const tree = await argumentApi.getTree(roomId);
      set({ tree, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addArgument: async (roomId, data) => {
    await argumentApi.create(roomId, data);
    await get().fetchTree(roomId);
  },

  vote: async (argumentId, value) => {
    await argumentApi.vote(argumentId, { value });
    set((s) => ({
      tree: updateNodeInTree(s.tree, argumentId, (node) => {
        const prev = node.myVote;
        let { agreeCount, disagreeCount } = node;
        if (prev === 'AGREE') agreeCount--;
        if (prev === 'DISAGREE') disagreeCount--;
        if (value === 'AGREE') agreeCount++;
        if (value === 'DISAGREE') disagreeCount++;
        return { ...node, myVote: value, agreeCount, disagreeCount };
      }),
    }));
  },

  removeVote: async (argumentId) => {
    await argumentApi.removeVote(argumentId);
    set((s) => ({
      tree: updateNodeInTree(s.tree, argumentId, (node) => {
        let { agreeCount, disagreeCount } = node;
        if (node.myVote === 'AGREE') agreeCount--;
        if (node.myVote === 'DISAGREE') disagreeCount--;
        return { ...node, myVote: null, agreeCount, disagreeCount };
      }),
    }));
  },

  deleteArgument: async (argumentId) => {
    await argumentApi.delete(argumentId);
    set((s) => ({
      tree: updateNodeInTree(s.tree, argumentId, (node) => ({
        ...node,
        deleted: true,
        content: '',
      })),
    }));
  },
}));
