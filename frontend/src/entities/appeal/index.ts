export type {
  Appeal,
  AppealDetails,
  AppealDetailsResponse,
  AppealComment,
  AppealHistoryEvent,
  AppealPayload,
  UpdateAppealPayload,
  FetchAppealsParams,
  HeatmapPoint,
  HeatmapStats,
  HeatmapParams,
  SimilarAppeal,
} from './model/types';

export {
  fetchAppeals,
  fetchAppealById,
  createAppeal,
  updateAppeal,
  hideAppeal,
  deleteAppeal,
  fetchAppealComments,
  postAppealComment,
  fetchAppealHistory,
  fetchHeatmapPoints,
  fetchHeatmapStats,
  fetchSimilarAppeals,
  mergeAppeals,
} from './api/appealsApi';

export {
  getAppealStatusColor,
  isAppealOverdue,
  formatAppealTags,
} from './lib/appealHelpers';
