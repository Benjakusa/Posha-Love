import { z } from 'zod';
import { AgeLevel, Role, SessionMode } from './enums';

export const GuestSessionRequest = z.object({
  ageDeclaration: z.literal(true),
});
export type GuestSessionRequest = z.infer<typeof GuestSessionRequest>;

export const GuestSessionResponse = z.object({
  token: z.string(),
  expiresAt: z.string(), // ISO
  alias: z.string(),
  ageLevel: z.string(), // G1 (guest) | L2 (member/creator)
  role: z.string(),     // guest | member | creator
  isNewUser: z.boolean().optional(),
  creatorStatus: z.enum(['approved', 'pending', 'rejected', 'none']).optional(),
});
export type GuestSessionResponse = z.infer<typeof GuestSessionResponse>;

export const AuthPrincipal = z.object({
  userId: z.string(),
  role: z.enum([Role.Guest, Role.Member, Role.Creator, Role.Moderator, Role.Admin]),
  ageLevel: z.enum([AgeLevel.L0, AgeLevel.G1, AgeLevel.L2, AgeLevel.L3]),
  alias: z.string(),
});
export type AuthPrincipal = z.infer<typeof AuthPrincipal>;

export const ConnectJoinQueue = z.object({
  mode: z.enum([SessionMode.Text, SessionMode.Video]),
  interests: z.array(z.string().max(24)).max(6).optional(),
  lang: z.string().min(2).max(8).optional(),
});
export type ConnectJoinQueue = z.infer<typeof ConnectJoinQueue>;

export const ConnectMessage = z.object({
  body: z.string().min(1).max(1000),
});
export type ConnectMessage = z.infer<typeof ConnectMessage>;

export const VideoConsent = z.object({
  accept: z.boolean(),
});
export type VideoConsent = z.infer<typeof VideoConsent>;

export const RtcOffer = z.object({
  sdp: z.string().max(16_384),
  type: z.literal('offer'),
});
export const RtcAnswer = z.object({
  sdp: z.string().max(16_384),
  type: z.literal('answer'),
});
export const RtcIce = z.object({
  candidate: z.string().max(2_048),
  sdpMid: z.string().max(64).nullable(),
  sdpMLineIndex: z.number().int().nullable(),
});
export type RtcOffer = z.infer<typeof RtcOffer>;
export type RtcAnswer = z.infer<typeof RtcAnswer>;
export type RtcIce = z.infer<typeof RtcIce>;

export const ReportCreate = z.object({
  targetType: z.enum(['session', 'user', 'video', 'message']),
  targetId: z.string(),
  reasonCode: z.enum([
    'harassment',
    'explicit_content',
    'minor_safety',
    'threats',
    'spam',
    'other',
  ]),
  details: z.string().max(2000).optional(),
  consentSnapshot: z.boolean().default(false),
});
export type ReportCreate = z.infer<typeof ReportCreate>;
