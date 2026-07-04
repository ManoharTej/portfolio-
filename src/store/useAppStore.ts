import { create } from 'zustand';

export type SceneState = 'arrival' | 'interview' | 'transition' | 'island';

interface AppState {
  currentScene: SceneState;
  interviewQuestionIndex: number;
  isWriting: boolean;
  isSittingAtTable: boolean;
  isSpeaking: boolean;
  currentSubtitle: string;
  isIntroFinished: boolean;
  activePaperIndex: number | null;
  handingOverPaperIndex: number | null;
  papers: string[];
  setScene: (scene: SceneState) => void;
  nextQuestion: () => void;
  setIsWriting: (isWriting: boolean) => void;
  setSittingAtTable: (isSitting: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setCurrentSubtitle: (subtitle: string) => void;
  setIsIntroFinished: (finished: boolean) => void;
  setActivePaper: (index: number | null) => void;
  setHandingOverPaperIndex: (index: number | null) => void;
  updatePaperText: (index: number, text: string) => void;
  isAskQuestionModalOpen: boolean;
  setIsAskQuestionModalOpen: (isOpen: boolean) => void;
  questionsAskedCount: number;
  incrementQuestionsAsked: () => void;
  aiAudioUrl: string | null;
  setAiAudioUrl: (url: string | null) => void;
  isTeleporting: boolean;
  setIsTeleporting: (val: boolean) => void;
  hasTeleported: boolean;
  setHasTeleported: (val: boolean) => void;
  isReturningToBench: boolean;
  returnTeleportPos: [number, number, number] | null;
  triggerReturnTeleport: (pos: [number, number, number]) => void;
  endReturnTeleport: () => void;
  focusedShelfTier: 'skills' | 'tools' | 'certs' | 'board' | null;
  setFocusedShelfTier: (tier: 'skills' | 'tools' | 'certs' | 'board' | null) => void;
  activeShelfItems: { skills: number, tools: number, certs: number, board: number };
  nextShelfItem: (tier: 'skills' | 'tools' | 'certs' | 'board', max: number) => void;
  prevShelfItem: (tier: 'skills' | 'tools' | 'certs' | 'board', max: number) => void;
  crystalFocusPoint: [number, number, number] | null;
  setCrystalFocusPoint: (point: [number, number, number] | null) => void;
  introStage: 'welcome' | 'form' | 'complete';
  setIntroStage: (stage: 'welcome' | 'form' | 'complete') => void;
  visitorName: string;
  setVisitorName: (name: string) => void;
  visitorEmail: string;
  setVisitorEmail: (email: string) => void;

  // New Game HUD & Audio States
  isMusicMuted: boolean;
  setIsMusicMuted: (muted: boolean) => void;
  isSfxMuted: boolean;
  setIsSfxMuted: (muted: boolean) => void;
  isOceanMuted: boolean;
  setIsOceanMuted: (muted: boolean) => void;
  isBirdsMuted: boolean;
  setIsBirdsMuted: (muted: boolean) => void;

  // Contact Card & Ending
  isContactCardVisible: boolean;
  setIsContactCardVisible: (v: boolean) => void;
  isContactFormOpen: boolean;
  setIsContactFormOpen: (v: boolean) => void;
  isEndingSequence: boolean;
  setIsEndingSequence: (v: boolean) => void;
  isCameraFlyAway: boolean;
  setIsCameraFlyAway: (v: boolean) => void;

  currentQuestId: 'reach_bench' | 'talk_to_avatar' | 'explore_island' | 'go_to_skills' | 'go_to_projects' | 'go_to_media' | 'go_to_contact' | null;
  setCurrentQuestId: (questId: 'reach_bench' | 'talk_to_avatar' | 'explore_island' | 'go_to_skills' | 'go_to_projects' | 'go_to_media' | 'go_to_contact' | null) => void;

  currentHint: string | null;
  setCurrentHint: (hint: string | null) => void;

  isMapExpanded: boolean;
  setIsMapExpanded: (expanded: boolean) => void;

  isSocialModalOpen: boolean;
  setIsSocialModalOpen: (isOpen: boolean) => void;

  isCameraDropComplete: boolean;
  setIsCameraDropComplete: (isComplete: boolean) => void;

  isAutoWalking: boolean;
  setIsAutoWalking: (val: boolean) => void;

  viewedSkills: number[];
  setViewedSkill: (index: number) => void;
  viewedTools: number[];
  setViewedTool: (index: number) => void;
  viewedCerts: number[];
  setViewedCert: (index: number) => void;
  viewedProjects: number[];
  setViewedProject: (index: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScene: 'arrival',
  interviewQuestionIndex: 0,
  isWriting: false,
  isSittingAtTable: false,
  isSpeaking: false,
  currentSubtitle: "",
  isIntroFinished: false,
  activePaperIndex: null,
  handingOverPaperIndex: null,
  papers: ["", "", "", "", ""],
  setScene: (scene) => set({ currentScene: scene }),
  nextQuestion: () =>
    set((state) => ({
      interviewQuestionIndex: Math.min(state.interviewQuestionIndex + 1, 5),
    })),
  setIsWriting: (isWriting) => set({ isWriting }),
  setSittingAtTable: (isSitting) => set({ isSittingAtTable: isSitting }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setCurrentSubtitle: (subtitle) => set({ currentSubtitle: subtitle }),
  setIsIntroFinished: (finished) => set({ isIntroFinished: finished }),
  setActivePaper: (index) => set({ activePaperIndex: index }),
  setHandingOverPaperIndex: (index) => set({ handingOverPaperIndex: index }),
  updatePaperText: (index, text) =>
    set((state) => {
      const newPapers = [...state.papers];
      newPapers[index] = text;
      return { papers: newPapers };
    }),
  isAskQuestionModalOpen: false,
  setIsAskQuestionModalOpen: (isOpen) => set({ isAskQuestionModalOpen: isOpen }),
  questionsAskedCount: 0,
  incrementQuestionsAsked: () => set((state) => ({ questionsAskedCount: state.questionsAskedCount + 1 })),
  aiAudioUrl: null,
  setAiAudioUrl: (url) => set({ aiAudioUrl: url }),
  isTeleporting: false,
  setIsTeleporting: (val) => set({ isTeleporting: val }),
  hasTeleported: false,
  setHasTeleported: (val) => set({ hasTeleported: val }),
  isReturningToBench: false,
  returnTeleportPos: null,
  triggerReturnTeleport: (pos) => set({ isReturningToBench: true, returnTeleportPos: pos }),
  endReturnTeleport: () => set({ isReturningToBench: false, returnTeleportPos: null }),
  focusedShelfTier: null,
  setFocusedShelfTier: (tier) => set({ focusedShelfTier: tier }),
  activeShelfItems: { skills: 0, tools: 0, certs: 0, board: 0 },
  nextShelfItem: (tier, max) => set((state) => ({
    activeShelfItems: {
      ...state.activeShelfItems,
      [tier]: tier === 'board' 
        ? Math.min(state.activeShelfItems[tier] + 1, max - 1)
        : (state.activeShelfItems[tier] + 1) % max
    }
  })),
  prevShelfItem: (tier, max) => set((state) => ({
    activeShelfItems: {
      ...state.activeShelfItems,
      [tier]: tier === 'board'
        ? Math.max(state.activeShelfItems[tier] - 1, 0)
        : (state.activeShelfItems[tier] - 1 + max) % max
    }
  })),
  crystalFocusPoint: null,
  setCrystalFocusPoint: (point) => set({ crystalFocusPoint: point }),
  introStage: 'welcome',
  setIntroStage: (stage) => set({ introStage: stage }),
  visitorName: '',
  setVisitorName: (name) => set({ visitorName: name }),
  visitorEmail: '',
  setVisitorEmail: (email) => set({ visitorEmail: email }),

  // New Game HUD & Audio States
  isMusicMuted: false,
  setIsMusicMuted: (muted) => set({ isMusicMuted: muted }),
  isSfxMuted: false,
  setIsSfxMuted: (muted) => set({ isSfxMuted: muted }),
  isOceanMuted: false,
  setIsOceanMuted: (muted) => set({ isOceanMuted: muted }),
  isBirdsMuted: false,
  setIsBirdsMuted: (muted) => set({ isBirdsMuted: muted }),

  // Contact Card & Ending
  isContactCardVisible: false,
  setIsContactCardVisible: (v) => set({ isContactCardVisible: v }),
  isContactFormOpen: false,
  setIsContactFormOpen: (v) => set({ isContactFormOpen: v }),
  isEndingSequence: false,
  setIsEndingSequence: (v) => set({ isEndingSequence: v }),
  isCameraFlyAway: false,
  setIsCameraFlyAway: (v) => set({ isCameraFlyAway: v }),

  currentQuestId: 'reach_bench',
  setCurrentQuestId: (questId) => set({ currentQuestId: questId }),

  currentHint: null,
  setCurrentHint: (hint) => set({ currentHint: hint }),

  isMapExpanded: false,
  setIsMapExpanded: (expanded) => set({ isMapExpanded: expanded }),

  isSocialModalOpen: false,
  setIsSocialModalOpen: (isOpen) => set({ isSocialModalOpen: isOpen }),

  isCameraDropComplete: false,
  setIsCameraDropComplete: (isComplete) => set({ isCameraDropComplete: isComplete }),

  isAutoWalking: false,
  setIsAutoWalking: (val) => set({ isAutoWalking: val }),

  viewedSkills: [],
  setViewedSkill: (index) => set((state) => {
    if (!state.viewedSkills.includes(index)) {
      return { viewedSkills: [...state.viewedSkills, index] };
    }
    return state;
  }),
  viewedTools: [],
  setViewedTool: (index) => set((state) => {
    if (!state.viewedTools.includes(index)) {
      return { viewedTools: [...state.viewedTools, index] };
    }
    return state;
  }),
  viewedCerts: [],
  setViewedCert: (index) => set((state) => {
    if (!state.viewedCerts.includes(index)) {
      return { viewedCerts: [...state.viewedCerts, index] };
    }
    return state;
  }),
  viewedProjects: [],
  setViewedProject: (index) => set((state) => {
    if (!state.viewedProjects.includes(index)) {
      return { viewedProjects: [...state.viewedProjects, index] };
    }
    return state;
  }),
}));
