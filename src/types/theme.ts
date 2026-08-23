export type ThemeId =
  | 'archive'
  | 'herbarium'
  | 'night-archive';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
}