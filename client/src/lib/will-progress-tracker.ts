export enum WillCreationStep {
  TEMPLATE_SELECTION = 'template_selection',
  AI_CHAT = 'ai_chat',
  DOCUMENT_UPLOAD = 'document_upload',
  VIDEO_RECORDING = 'video_recording',
  FINAL_REVIEW = 'final_review',
  COMPLETED = 'completed'
}

export interface WillProgress {
  currentStep: WillCreationStep;
  started: string; // ISO date string
  lastUpdated: string; // ISO date string
  willData?: any; // Any will data collected so far
  completed: boolean;
}

const WILL_PROGRESS_KEY = 'will_progress';

/**
 * Save the current progress of will creation
 */
export function saveWillProgress(step: WillCreationStep, willData?: any): void {
  const now = new Date().toISOString();
  
  // Get existing progress or create new
  const existingProgress = getWillProgress();
  
  const progress: WillProgress = {
    currentStep: step,
    started: existingProgress?.started || now,
    lastUpdated: now,
    willData: willData || existingProgress?.willData || {},
    completed: step === WillCreationStep.COMPLETED
  };
  
  localStorage.setItem(WILL_PROGRESS_KEY, JSON.stringify(progress));
}

/**
 * Get the saved will creation progress
 */
export function getWillProgress(): WillProgress | null {
  const progress = localStorage.getItem(WILL_PROGRESS_KEY);
  
  if (progress) {
    return JSON.parse(progress) as WillProgress;
  }
  
  return null;
}

/**
 * Clear saved will progress
 */
export function clearWillProgress(): void {
  localStorage.removeItem(WILL_PROGRESS_KEY);
}

/**
 * Check if there's an unfinished will
 */
export function hasUnfinishedWill(): boolean {
  const progress = getWillProgress();
  
  // If there's no progress or the will is completed, there's no unfinished will
  if (!progress || progress.completed) {
    return false;
  }
  
  return true;
}

/**
 * Get the route for the current step
 */
export function getRouteForStep(step: WillCreationStep): string {
  switch (step) {
    case WillCreationStep.TEMPLATE_SELECTION:
      return '/template-selection';
    case WillCreationStep.AI_CHAT:
      return '/ai-chat';
    case WillCreationStep.DOCUMENT_UPLOAD:
      return '/document-upload';
    case WillCreationStep.VIDEO_RECORDING:
      return '/video-recording';
    case WillCreationStep.FINAL_REVIEW:
      return '/final-review';
    case WillCreationStep.COMPLETED:
      return '/dashboard';
    default:
      return '/template-selection';
  }
}