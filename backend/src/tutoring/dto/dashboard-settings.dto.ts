import { IsInt, IsArray, IsObject, IsOptional } from 'class-validator';

export class DashboardSettingsDto {
  @IsInt()
  childId: number;

  @IsOptional()
  @IsArray()
  preferredSubjectIds?: number[];

  @IsOptional()
  @IsObject()
  widgetPreferences?: {
    showUpcomingSessions?: boolean;
    showRecentAchievements?: boolean;
    showProgressSummary?: boolean;
    showLearningHours?: boolean;
  };

  @IsOptional()
  @IsObject()
  displayPreferences?: {
    colorTheme?: string;
    layout?: string;
  };

  @IsOptional()
  @IsArray()
  pinnedItems?: {
    type: string;
    id: number;
  }[];
}
