import { KeystrokeEvent, PasteEvent } from '../types';

export interface KeyboardMonitorState {
  isMonitoring: boolean;
  keystrokes: KeystrokeEvent[];
  pasteEvents: PasteEvent[];
  lastKeystrokeTime: number;
}

export class KeyboardMonitor {
  private state: KeyboardMonitorState;
  private editorElement: HTMLTextAreaElement | null = null;
  private lastContentLength: number = 0;

  constructor() {
    this.state = {
      isMonitoring: false,
      keystrokes: [],
      pasteEvents: [],
      lastKeystrokeTime: Date.now(),
    };
  }

  /**
   * Start monitoring keyboard activity
   */
  public startMonitoring(editorElement: HTMLTextAreaElement) {
    if (this.state.isMonitoring) return;

    this.editorElement = editorElement;
    this.lastContentLength = editorElement.value.length;
    this.state.isMonitoring = true;
    this.state.keystrokes = [];
    this.state.pasteEvents = [];

    // Add event listeners
    this.editorElement.addEventListener('keydown', this.handleKeydown.bind(this));
    this.editorElement.addEventListener('keyup', this.handleKeyup.bind(this));
    this.editorElement.addEventListener('paste', this.handlePaste.bind(this));

    console.log('Keyboard monitoring started');
  }

  /**
   * Stop monitoring keyboard activity
   */
  public stopMonitoring() {
    if (!this.state.isMonitoring || !this.editorElement) return;

    this.editorElement.removeEventListener('keydown', this.handleKeydown.bind(this));
    this.editorElement.removeEventListener('keyup', this.handleKeyup.bind(this));
    this.editorElement.removeEventListener('paste', this.handlePaste.bind(this));

    this.state.isMonitoring = false;
    console.log('Keyboard monitoring stopped');
  }

  /**
   * Handle keydown events (Feature #3)
   */
  private handleKeydown = (event: KeyboardEvent) => {
    const now = Date.now();
    const timeSinceLastKey = now - this.state.lastKeystrokeTime;

    this.state.keystrokes.push({
      timestamp: now,
      keyCode: event.keyCode,
      keyType: 'keydown',
      timeSinceLastKey,
    });

    this.state.lastKeystrokeTime = now;
  };

  /**
   * Handle keyup events (Feature #3)
   */
  private handleKeyup = (event: KeyboardEvent) => {
    const now = Date.now();

    this.state.keystrokes.push({
      timestamp: now,
      keyCode: event.keyCode,
      keyType: 'keyup',
    });
  };

  /**
   * Detect pasted text (Feature #4)
   */
  private handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const now = Date.now();
    const position = this.editorElement?.selectionStart || 0;

    // Record paste event
    this.state.pasteEvents.push({
      timestamp: now,
      pastedTextLength: pastedText.length,
      position,
    });

    // Insert pasted text into editor
    if (this.editorElement) {
      const before = this.editorElement.value.substring(0, position);
      const after = this.editorElement.value.substring(position);
      this.editorElement.value = before + pastedText + after;

      // Update cursor position
      this.editorElement.selectionStart = position + pastedText.length;
      this.editorElement.selectionEnd = position + pastedText.length;

      // Trigger input event for UI updates
      this.editorElement.dispatchEvent(new Event('input', { bubbles: true }));
    }

    console.log(`Paste detected: ${pastedText.length} characters`);
  };

  /**
   * Get keystroke data
   */
  public getKeystrokes(): KeystrokeEvent[] {
    return this.state.keystrokes;
  }

  /**
   * Get paste events
   */
  public getPasteEvents(): PasteEvent[] {
    return this.state.pasteEvents;
  }

  /**
   * Get current monitoring state
   */
  public getState(): KeyboardMonitorState {
    return this.state;
  }

  /**
   * Reset monitoring data
   */
  public reset() {
    this.state.keystrokes = [];
    this.state.pasteEvents = [];
    this.state.lastKeystrokeTime = Date.now();
  }
}

export default KeyboardMonitor;
