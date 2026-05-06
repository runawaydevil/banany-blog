import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authenticateJobRunner,
  claimPendingJobs,
  markJobDone,
  markJobFailed,
} from "@/lib/jobs";
import { sendAutomaticPostPublishNewsletter } from "@/lib/post-publish-newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 10;
const LOCK_TTL_SEC = 10 * 60;

export async function POST(req: Request) {
  const auth = authenticateJobRunner(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT);
  const claimed = await claimPendingJobs({
    limit: Number.isFinite(limit) ? limit : DEFAULT_LIMIT,
    runnerId: auth.runnerId,
    lockTtlSec: LOCK_TTL_SEC,
  });

  let done = 0;
  let failed = 0;

  for (const job of claimed) {
    try {
      if (job.type === "NEWSLETTER_POST_PUBLISH") {
        if (!job.postId) {
          throw new Error("Job is missing postId");
        }
        const post = await prisma.post.findUnique({
          where: { id: job.postId },
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            contentFormat: true,
          },
        });
        if (!post) {
          throw new Error("Post not found");
        }

        const result = await sendAutomaticPostPublishNewsletter(post);
        await markJobDone(job.id, result);
        done++;
        continue;
      }

      throw new Error(`Unknown job type: ${job.type}`);
    } catch (e) {
      await markJobFailed(job.id, e);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    claimed: claimed.length,
    done,
    failed,
  });
}

