// Define the will creation steps
export enum WillCreationStep {
  TEMPLATE_SELECTION = 'template_selection',
  AI_CHAT = 'ai_chat',
  DOCUMENT_UPLOAD = 'document_upload',
  VIDEO_RECORDING = 'video_recording',
  FINAL_REVIEW = 'final_review',
  COMPLETED = 'completed'
}

// Define the will progress type
export interface WillProgress {
  currentStep: WillCreationStep;
  started: string; // ISO date string
  lastUpdated: string; // ISO date string
  willData?: any; // Any will data collected so far
  completed: boolean;
}

// Local storage key for saving progress
const WILL_PROGRESS_KEY = 'willCreationProgress';

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
    willData: willData || existingProgress?.willData,
    completed: step === WillCreationStep.COMPLETED
  };
  
  localStorage.setItem(WILL_PROGRESS_KEY, JSON.stringify(progress));
}

/**
 * Get the saved will creation progress
 */
export function getWillProgress(): WillProgress | null {
  const savedProgress = localStorage.getItem(WILL_PROGRESS_KEY);
  
  if (!savedProgress) {
    return null;
  }
  
  try {
    return JSON.parse(savedProgress) as WillProgress;
  } catch (error) {
    console.error('Error parsing saved will progress:', error);
    return null;
  }
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
  
  if (!progress) {
    return false;
  }
  
  return !progress.completed;
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