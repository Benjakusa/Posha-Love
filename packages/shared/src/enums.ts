// Enums shared by API and mobile. Keep string literals stable — they go over the wire.

export const AgeLevel = {
  L0: 'L0', // unverified
  G1: 'G1', // guest, self-declared 18+
  L2: 'L2', // provider-verified adult
  L3: 'L3', // creator KYC
} as const;
export type AgeLevel = (typeof AgeLevel)[keyof typeof AgeLevel];

export const AccountStatus = {
  Active: 'active',
  Suspended: 'suspended',
  Banned: 'banned',
  Deleted: 'deleted',
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const Role = {
  Guest: 'guest',
  Member: 'member',
  Creator: 'creator',
  Moderator: 'moderator',
  Admin: 'admin',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const SessionMode = {
  Text: 'text',
  Video: 'video',
} as const;
export type SessionMode = (typeof SessionMode)[keyof typeof SessionMode];

export const SessionEndReason = {
  Next: 'next',
  Leave: 'leave',
  Report: 'report',
  Block: 'block',
  Timeout: 'timeout',
  VideoLimit: 'video_limit',
  Error: 'error',
} as const;
export type SessionEndReason = (typeof SessionEndReason)[keyof typeof SessionEndReason];

export const PaymentStatus = {
  Created: 'created',
  Pending: 'pending',
  Succeeded: 'succeeded',
  Failed: 'failed',
  Cancelled: 'cancelled',
  Refunded: 'refunded',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const ReportStatus = {
  Open: 'open',
  Triaged: 'triaged',
  Actioned: 'actioned',
  Dismissed: 'dismissed',
  Escalated: 'escalated',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const VideoReviewStatus = {
  Uploaded: 'uploaded',
  Processing: 'processing',
  PendingReview: 'pending_review',
  Approved: 'approved',
  Rejected: 'rejected',
} as const;
export type VideoReviewStatus = (typeof VideoReviewStatus)[keyof typeof VideoReviewStatus];
