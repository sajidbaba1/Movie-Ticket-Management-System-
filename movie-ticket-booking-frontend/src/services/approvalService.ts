import apiClient from './api';

export type ApprovalEntityType = 'THEATER' | 'MOVIE' | 'SHOW' | 'SCHEDULE' | 'SCREEN' | 'COUPON';

export const approvalService = {
  async approve(type: ApprovalEntityType, id: number, notes?: string) {
    const t = type === 'SCHEDULE' ? 'SCHEDULE' : type; // backend also accepts SHOW
    const urlType = t === 'SCHEDULE' ? 'SCHEDULE' : t;
    const res = await apiClient.post(`/approvals/${urlType}/${id}/approve`, notes ? { notes } : {});
    return res.data;
  },

  async deny(type: ApprovalEntityType, id: number, notes?: string) {
    const t = type === 'SCHEDULE' ? 'SCHEDULE' : type; // backend also accepts SHOW
    const urlType = t === 'SCHEDULE' ? 'SCHEDULE' : t;
    const res = await apiClient.post(`/approvals/${urlType}/${id}/deny`, notes ? { notes } : {});
    return res.data;
  },
};
