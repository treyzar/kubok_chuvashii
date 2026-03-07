import type { Appeal } from '../model/types';

export const getAppealStatusColor = (status: Appeal['status']): string => {
  switch (status) {
    case 'init':
      return 'bg-gray-100 text-gray-800';
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'closed':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const isAppealOverdue = (appeal: Appeal, maxDays: number = 30): boolean => {
  const createdDate = new Date(appeal.created_at);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  return appeal.status === 'open' && daysDiff > maxDays;
};

export const formatAppealTags = (appeal: Appeal): string => {
  if (appeal.tag_names && appeal.tag_names.length > 0) {
    return appeal.tag_names.join(', ');
  }
  return '';
};
