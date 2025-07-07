// Core application types

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  isDemo?: boolean;
  demoType?: 'personal' | 'team';
  createdAt?: string;
  updatedAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  emailDigest: boolean;
  timezone: string;
  language: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assignee?: User;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  comments?: Comment[];
  attachments?: Attachment[];
  subtasks?: Subtask[];
  estimatedHours?: number;
  actualHours?: number;
  sheetId?: string;
  rowIndex?: number;
}

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'blocked' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  mentions?: string[];
  reactions?: Reaction[];
  parentId?: string; // For threaded comments
  replies?: Comment[];
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner: User;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
  settings: TeamSettings;
  inviteCode?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  user: User;
  teamId: string;
  role: TeamRole;
  joinedAt: string;
  permissions: Permission[];
  isActive: boolean;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface TeamSettings {
  isPublic: boolean;
  allowGuestAccess: boolean;
  defaultTaskStatus: TaskStatus;
  requiredTaskFields: string[];
  workingDays: number[];
  workingHours: {
    start: string;
    end: string;
  };
  timezone: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  teams: Team[];
  sheets: GoogleSheet[];
  createdAt: string;
  updatedAt: string;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface GoogleSheet {
  id: string;
  name: string;
  url: string;
  webViewLink: string;
  modifiedTime: string;
  isOwner: boolean;
  isShared: boolean;
  lastModified: string;
  permissions: GoogleSheetPermission[];
  isNew?: boolean;
  isConnected?: boolean;
  syncStatus?: SyncStatus;
}

export interface GoogleSheetPermission {
  id: string;
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'writer' | 'reader';
  emailAddress?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  userId: string;
  user: User;
  taskId?: string;
  task?: Task;
  teamId?: string;
  team?: Team;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  isRead: boolean;
}

export type ActivityType = 
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_assigned'
  | 'comment_added'
  | 'team_joined'
  | 'team_left'
  | 'file_uploaded'
  | 'sheet_connected'
  | 'sync_completed'
  | 'sync_failed';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'task_reminder'
  | 'team_invitation'
  | 'system_update';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface PresenceInfo {
  userId: string;
  user: User;
  status: PresenceStatus;
  lastSeen: string;
  currentLocation?: string;
  cursor?: CursorPosition;
  isTyping?: boolean;
}

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

export interface StandupEntry {
  id: string;
  userId: string;
  user: User;
  teamId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  mood: MoodLevel;
  workload: WorkloadLevel;
  createdAt: string;
  updatedAt: string;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type WorkloadLevel = 'light' | 'moderate' | 'heavy' | 'overwhelming';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form types
export interface CreateTaskForm {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
}

export interface UpdateTaskForm extends Partial<CreateTaskForm> {
  status?: TaskStatus;
}

export interface CreateTeamForm {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface CreateCommentForm {
  content: string;
  taskId: string;
  mentions?: string[];
  parentId?: string;
}

// Event types for real-time features
export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: any;
  userId: string;
  timestamp: string;
  sessionId: string;
}

export type RealtimeEventType =
  | 'user_joined'
  | 'user_left'
  | 'task_updated'
  | 'comment_added'
  | 'cursor_moved'
  | 'typing_started'
  | 'typing_stopped'
  | 'presence_changed';

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  userId?: string;
  stackTrace?: string;
}

export type ErrorCode =
  | 'AUTH_FAILED'
  | 'PERMISSION_DENIED'
  | 'RESOURCE_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'EXTERNAL_SERVICE_ERROR';

// Environment types
export interface EnvironmentConfig {
  VITE_GOOGLE_CLIENT_ID: string;
  VITE_GOOGLE_SHEETS_API_KEY: string;
  VITE_API_BASE_URL: string;
  VITE_WS_URL: string;
  VITE_SENTRY_DSN?: string;
  VITE_ENVIRONMENT: 'development' | 'staging' | 'production';
  VITE_FEATURE_FLAGS?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type EntityWithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};