/**
 * Library for tracking user progress through the will creation process
 * Helps with resuming from where user left off and preventing accidental data loss
 */

export enum WillCreationStep {
  NOT_STARTED = 'not_started',
  TEMPLATE_SELECTION = 'template_selection',
  AI_CHAT = 'ai_chat',
  DOCUMENT_UPLOAD = 'document_upload',
  VIDEO_RECORDING = 'video_recording',
  FINAL_REVIEW = 'final_review',
  COMPLETED = 'completed'
}

// Key for localStorage
const WILL_PROGRESS_KEY = 'willProgress';
const WILL_LAST_STEP_KEY = 'willLastStep';
const WILL_LAST_UPDATED_KEY = 'willLastUpdated';

/**
 * Save the current step in the will creation process
 * @param step The current step
 */
export function saveWillProgress(step: WillCreationStep): void {
  try {
    // Save current step
    localStorage.setItem(WILL_PROGRESS_KEY, step);
    
    // Save timestamp
    localStorage.setItem(WILL_LAST_UPDATED_KEY, new Date().toISOString());
    
    // If this is not the first step and not the last step, save as "last significant step"
    // This helps with resuming from the correct place
    if (step !== WillCreationStep.NOT_STARTED && step !== WillCreationStep.COMPLETED) {
      localStorage.setItem(WILL_LAST_STEP_KEY, step);
    }
    
    console.log(`Will progress saved: ${step}`);
  } catch (error) {
    console.error('Error saving will progress:', error);
  }
}

/**
 * Get the current step in the will creation process
 */
export function getWillProgress(): WillCreationStep {
  try {
    const savedProgress = localStorage.getItem(WILL_PROGRESS_KEY);
    
    if (!savedProgress) {
      return WillCreationStep.NOT_STARTED;
    }
    
    return savedProgress as WillCreationStep;
  } catch (error) {
    console.error('Error getting will progress:', error);
    return WillCreationStep.NOT_STARTED;
  }
}

/**
 * Get the last significant step the user completed
 * This is used for resuming from where the user left off
 */
export function getLastStep(): WillCreationStep {
  try {
    const lastStep = localStorage.getItem(WILL_LAST_STEP_KEY);
    
    if (!lastStep) {
      return WillCreationStep.NOT_STARTED;
    }
    
    return lastStep as WillCreationStep;
  } catch (error) {
    console.error('Error getting last will step:', error);
    return WillCreationStep.NOT_STARTED;
  }
}

/**
 * Check if the user has an unfinished will
 */
export function hasUnfinishedWill(): boolean {
  try {
    const currentProgress = getWillProgress();
    
    // If the progress is not "not_started" and not "completed"
    // then the user has an unfinished will
    return (
      currentProgress !== WillCreationStep.NOT_STARTED &&
      currentProgress !== WillCreationStep.COMPLETED
    );
  } catch (error) {
    console.error('Error checking for unfinished will:', error);
    return false;
  }
}

/**
 * Get a URL to resume the will creation process from the last step
 */
export function getResumeUrl(): string {
  try {
    const lastStep = getLastStep();
    
    switch (lastStep) {
      case WillCreationStep.TEMPLATE_SELECTION:
        return '/template-selection';
      case WillCreationStep.AI_CHAT:
        return '/create-will';
      case WillCreationStep.DOCUMENT_UPLOAD:
        return '/document-upload';
      case WillCreationStep.VIDEO_RECORDING:
        return '/video-recording';
      case WillCreationStep.FINAL_REVIEW:
        return '/finalize';
      default:
        return '/welcome';
    }
  } catch (error) {
    console.error('Error getting resume URL:', error);
    return '/welcome';
  }
}

/**
 * Get the last time the will was updated
 */
export function getLastUpdated(): Date | null {
  try {
    const lastUpdated = localStorage.getItem(WILL_LAST_UPDATED_KEY);
    
    if (!lastUpdated) {
      return null;
    }
    
    return new Date(lastUpdated);
  } catch (error) {
    console.error('Error getting last updated timestamp:', error);
    return null;
  }
}

/**
 * Reset the will progress tracker
 * This should be called when the user completes their will
 * or when they explicitly choose to start over
 */
export function resetWillProgress(): void {
  try {
    localStorage.removeItem(WILL_PROGRESS_KEY);
    localStorage.removeItem(WILL_LAST_STEP_KEY);
    localStorage.removeItem(WILL_LAST_UPDATED_KEY);
    console.log('Will progress reset');
  } catch (error) {
    console.error('Error resetting will progress:', error);
  }
}

/**
 * Get a user-friendly description of the current step
 */
export function getStepDescription(step: WillCreationStep): string {
  switch (step) {
    case WillCreationStep.NOT_STARTED:
      return 'Not Started';
    case WillCreationStep.TEMPLATE_SELECTION:
      return 'Template Selection';
    case WillCreationStep.AI_CHAT:
      return 'Talking with Skyler';
    case WillCreationStep.DOCUMENT_UPLOAD:
      return 'Document Upload';
    case WillCreationStep.VIDEO_RECORDING:
      return 'Video Recording';
    case WillCreationStep.FINAL_REVIEW:
      return 'Final Review';
    case WillCreationStep.COMPLETED:
      return 'Completed';
    default:
      return 'Unknown';
  }
}