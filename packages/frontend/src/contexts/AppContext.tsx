import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UserCategory, MatchingFilter, Region } from '../types';

// Estado de la aplicación
export type SessionState = 'idle' | 'filter-selection' | 'waiting' | 'in-chat';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface Session {
  sessionId: string;
  peerId: string;
  isPeerBot: boolean;
  startTime: number;
}

export interface AppState {
  connectionStatus: ConnectionStatus;
  sessionState: SessionState;
  currentSession: Session | null;
  userCategory: UserCategory | null;
  matchingFilter: MatchingFilter;
  regionFilter: Region;
  detectedRegion: Region | null;
}

// Acciones
type AppAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_SESSION_STATE'; payload: SessionState }
  | { type: 'SET_CURRENT_SESSION'; payload: Session | null }
  | { type: 'SET_USER_CATEGORY'; payload: UserCategory }
  | { type: 'SET_MATCHING_FILTER'; payload: MatchingFilter }
  | { type: 'SET_REGION_FILTER'; payload: Region }
  | { type: 'SET_DETECTED_REGION'; payload: Region }
  | { type: 'RESET_SESSION' };

// Estado inicial
const initialState: AppState = {
  connectionStatus: 'disconnected',
  sessionState: 'idle',
  currentSession: null,
  userCategory: null,
  matchingFilter: 'any',
  regionFilter: 'any',
  detectedRegion: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    case 'SET_SESSION_STATE':
      return { ...state, sessionState: action.payload };
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'SET_USER_CATEGORY':
      return { ...state, userCategory: action.payload };
    
    case 'SET_MATCHING_FILTER':
      return { ...state, matchingFilter: action.payload };
    
    case 'SET_REGION_FILTER':
      return { ...state, regionFilter: action.payload };
    
    case 'SET_DETECTED_REGION':
      return { ...state, detectedRegion: action.payload };
    
    case 'RESET_SESSION':
      return {
        ...state,
        sessionState: 'idle',
        currentSession: null,
      };
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
}
