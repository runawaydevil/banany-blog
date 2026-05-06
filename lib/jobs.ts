import { Prisma, type Job, type JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type JobRunnerAuthResult =
  | { ok: true; runnerId: string }
  | { ok: false };

export function authenticateJobRunner(req: Request): JobRunnerAuthResult {
  const token = process.env.JOBS_RUNNER_TOKEN?.trim();
  if (!token) return { ok: false };

  const header = req.headers.get("authorization")?.trim() ?? "";
  const m = /^bearer\s+(.+)$/i.exec(header);
  const presented = m?.[1]?.trim();
  if (!presented) return { ok: false };

  // Simple constant-time-ish compare for short tokens
  if (presented.length !== token.length) return { ok: false };
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ presented.charCodeAt(i);
  if (diff !== 0) return { ok: false };

  return { ok: true, runnerId: "http-runner" };
}

export async function enqueueNewsletterPostPublishJob(postId: string): Promise<{
  enqueued: boolean;
}> {
  try {
    await prisma.job.create({
      data: {
        type: "NEWSLETTER_POST_PUBLISH",
        status: "PENDING",
        postId,
        runAt: new Date(),
      },
    });
    return { enqueued: true };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { enqueued: false };
    }
    throw e;
  }
}

export type ClaimedJob = Pick<
  Job,
  "id" | "type" | "status" | "postId" | "payload" | "attempts" | "maxAttempts"
>;

export async function claimPendingJobs(input: {
  limit: number;
  runnerId: string;
  lockTtlSec: number;
}): Promise<ClaimedJob[]> {
  const limit = Math.max(1, Math.min(100, input.limit));
  const lockTtlSec = Math.max(30, Math.min(60 * 60, input.lockTtlSec));

  const claimed = await prisma.$queryRaw<ClaimedJob[]>`
WITH candidates AS (
  SELECT "id"
  FROM "Job"
  WHERE
    "status" = 'PENDING'::"JobStatus"
    AND "runAt" <= now()
    AND (
      "lockedAt" IS NULL
      OR "lockedAt" < now() - make_interval(secs => ${lockTtlSec})
    )
  ORDER BY "runAt" ASC
  LIMIT ${limit}
  FOR UPDATE SKIP LOCKED
)
UPDATE "Job" j
SET
  "status" = 'RUNNING'::"JobStatus",
  "lockedAt" = now(),
  "lockedBy" = ${input.runnerId},
  "updatedAt" = now()
FROM candidates c
WHERE j."id" = c."id"
RETURNING j."id", j."type", j."status", j."postId", j."payload", j."attempts", j."maxAttempts"
`;

  return claimed;
}

export function nextRetryDelaySec(attemptsAfterFailure: number): number {
  // Exponential-ish backoff: 30s, 60s, 2m, 4m, ... capped at 1h
  const base = 30;
  const exp = Math.max(0, attemptsAfterFailure - 1);
  const delay = base * Math.pow(2, exp);
  return Math.min(60 * 60, Math.floor(delay));
}

export async function markJobDone(jobId: string, result: unknown): Promise<void> {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "DONE",
      lockedAt: null,
      lockedBy: null,
      lastError: null,
      result: result as Prisma.InputJsonValue,
    },
  });
}

export async function markJobFailed(jobId: string, error: unknown): Promise<{
  status: JobStatus;
  attempts: number;
  runAt: Date;
}> {
  const message =
    error instanceof Error && error.message ? error.message : String(error);

  const current = await prisma.job.findUnique({
    where: { id: jobId },
    select: { attempts: true, maxAttempts: true },
  });
  if (!current) {
    return { status: "FAILED", attempts: 0, runAt: new Date() };
  }

  const attempts = current.attempts + 1;
  const canRetry = attempts < current.maxAttempts;
  const delaySec = nextRetryDelaySec(attempts);
  const runAt = canRetry ? new Date(Date.now() + delaySec * 1000) : new Date();

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      attempts,
      status: canRetry ? "PENDING" : "FAILED",
      runAt,
      lockedAt: null,
      lockedBy: null,
      lastError: message.slice(0, 8000),
    },
    select: { status: true, attempts: true, runAt: true },
  });

  return updated;
}

