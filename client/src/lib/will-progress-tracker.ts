/**
 * Will creation progress tracker
 * This module helps track and save the progress of will creation
 */

// Enum for will creation steps
export enum WillCreationStep {
  NOT_STARTED = 'not_started',
  CHAT = 'chat',
  DOCUMENT_UPLOAD = 'document_upload',
  CONTACT_INFO = 'contact_info',
  VIDEO_RECORDING = 'video_recording',
  FINAL_REVIEW = 'final_review',
  PAYMENT = 'payment',
  COMPLETED = 'completed'
}

// Get step descriptions for UI display
export function getStepDescription(step: WillCreationStep): string {
  switch (step) {
    case WillCreationStep.CHAT:
      return 'Skyler Will Creation';
    case WillCreationStep.DOCUMENT_UPLOAD:
      return 'Document Upload';
    case WillCreationStep.CONTACT_INFO:
      return 'Contact Information';
    case WillCreationStep.VIDEO_RECORDING:
      return 'Video Recording';
    case WillCreationStep.FINAL_REVIEW:
      return 'Final Review';
    case WillCreationStep.PAYMENT:
      return 'Subscription Setup';
    case WillCreationStep.COMPLETED:
      return 'Completed Will';
    default:
      return 'Will Creation';
  }
}

// Get the last step saved in localStorage
export function getLastStep(): WillCreationStep {
  return getWillProgress().step;
}

// Get last updated timestamp
export function getLastUpdated(): Date | null {
  return getWillProgress().timestamp;
}

// Get resume URL
export function getResumeUrl(): string {
  return getContinueUrl();
}

// Save the current step to localStorage
export function saveWillProgress(step: WillCreationStep): void {
  try {
    // Save the current step
    localStorage.setItem('willCreationStep', step);
    
    // Save timestamp
    localStorage.setItem('willCreationTimestamp', new Date().toISOString());
    
    // Also update on server if possible
    updateServerProgress(step).catch(err => {
      console.warn('Failed to update server progress:', err);
    });
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

// Get the current progress step
export function getWillProgress(): {
  step: WillCreationStep;
  timestamp: Date | null;
} {
  try {
    const step = localStorage.getItem('willCreationStep') as WillCreationStep || WillCreationStep.NOT_STARTED;
    const timestampStr = localStorage.getItem('willCreationTimestamp');
    
    return {
      step,
      timestamp: timestampStr ? new Date(timestampStr) : null
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    return {
      step: WillCreationStep.NOT_STARTED,
      timestamp: null
    };
  }
}

// Check if there's an unfinished will creation
export function hasUnfinishedWill(): boolean {
  const { step } = getWillProgress();
  return step !== WillCreationStep.NOT_STARTED && step !== WillCreationStep.COMPLETED;
}

// Get the next step in the flow
export function getNextStep(currentStep: WillCreationStep): WillCreationStep {
  switch (currentStep) {
    case WillCreationStep.NOT_STARTED:
      return WillCreationStep.CHAT;
    case WillCreationStep.CHAT:
      return WillCreationStep.DOCUMENT_UPLOAD;
    case WillCreationStep.DOCUMENT_UPLOAD:
      return WillCreationStep.CONTACT_INFO;
    case WillCreationStep.CONTACT_INFO:
      return WillCreationStep.VIDEO_RECORDING;
    case WillCreationStep.VIDEO_RECORDING:
      return WillCreationStep.FINAL_REVIEW;
    case WillCreationStep.FINAL_REVIEW:
      return WillCreationStep.PAYMENT;
    case WillCreationStep.PAYMENT:
      return WillCreationStep.COMPLETED;
    default:
      return WillCreationStep.NOT_STARTED;
  }
}

// Reset progress (for new will creation)
export function resetWillProgress(): void {
  try {
    // Clear all will creation progress data
    localStorage.removeItem('willCreationStep');
    localStorage.removeItem('willCreationTimestamp');
    localStorage.removeItem('willData');
    localStorage.removeItem('willContacts');
    localStorage.removeItem('willVideoRecorded');
    localStorage.removeItem('willVideoDate');
    
    // Also clear template and current will ID to start completely fresh
    localStorage.removeItem('selectedWillTemplate');
    localStorage.removeItem('currentWillId');
    
    console.log('Will progress completely reset');
  } catch (error) {
    console.error('Error resetting progress:', error);
  }
}

// Update progress on server
async function updateServerProgress(step: WillCreationStep): Promise<void> {
  const willId = localStorage.getItem('currentWillId');
  
  if (!willId) {
    return;
  }
  
  try {
    const response = await fetch('/api/user/will-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        willId,
        progress: step,
        willInProgress: step !== WillCreationStep.COMPLETED,
        willCompleted: step === WillCreationStep.COMPLETED
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update progress: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating progress on server:', error);
    throw error;
  }
}

// Get a URL for continuing will creation from where user left off
export function getContinueUrl(): string {
  const { step } = getWillProgress();
  
  switch (step) {
    case WillCreationStep.CHAT:
      return '/ai-chat';
    case WillCreationStep.DOCUMENT_UPLOAD:
      return '/document-upload';
    case WillCreationStep.CONTACT_INFO:
      return '/contact-information';
    case WillCreationStep.VIDEO_RECORDING:
      return '/video-recording';
    case WillCreationStep.FINAL_REVIEW:
      return '/final-review';
    case WillCreationStep.PAYMENT:
      return '/subscription';
    case WillCreationStep.COMPLETED:
      return '/dashboard';
    default:
      return '/ai-chat';
  }
}