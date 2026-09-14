export type ToolType = 'pencil' | 'brush' | 'marker' | 'eraser' | 'rect' | 'circle' | 'triangle' | 'star';

export interface LayerState {
  id: string;
  name: string;
  type: 'ia_base' | 'manual_drawing' | 'effects';
  visible: boolean;
  opacity: number;
  locked: boolean;
}

export interface VoiceAction {
  action: 'ADD_SHAPE' | 'CHANGE_BG' | 'CLEAR_CANVAS' | 'GENERATE_ART' | 'SET_TOOL' | 'SET_COLOR' | 'UNDO';
  shape?: 'rect' | 'circle' | 'triangle' | 'star';
  color?: string;
  size?: number;
  prompt?: string;
  tool?: ToolType;
  artElements?: {
    type: 'circle' | 'rect' | 'path' | 'gradient';
    x: number;
    y: number;
    fill: string;
    stroke?: string;
    radius?: number;
    width?: number;
    height?: number;
    opacity?: number;
  }[];
  explanation?: string;
}

export interface CommandHistoryItem {
  id: string;
  timestamp: string;
  text: string;
  action: string;
  status: 'pending' | 'success' | 'error';
  explanation?: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeButtons: boolean;
  soundFeedback: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}
