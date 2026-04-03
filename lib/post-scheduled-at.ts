/** Reject schedule times clearly in the past (small slack for client/server clock skew). */
const PAST_SLACK_MS = 90_000;

export function scheduledAtInPastMessage(scheduledAt: Date): string | null {
  if (scheduledAt.getTime() < Date.now() - PAST_SLACK_MS) {
    return "Schedule date cannot be in the past";
  }
  return null;
}
