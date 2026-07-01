import prisma from "../../config/prisma.js";
import { redisConnection } from "../../config/redis.js";

type CheckStatus = "ok" | "error" | "not_configured";

type ReadinessCheck = {
  status: CheckStatus;
  message?: string;
};

export async function getReadiness() {
  const checks = {
    db: await checkDb(),
    redis: await checkRedis(),
    s3: checkEnv(["S3_BUCKET_NAME", "BUCKET_NAME", "BUCKET"], "S3 bucket is not configured"),
    stripe: checkEnv(["STRIPE_SECRET_KEY"], "Stripe secret key is not configured"),
    twilio: checkEnv(
      ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_TRUNK_SID"],
      "Twilio credentials or trunk are not configured",
      "all"
    ),
    livekit: checkEnv(
      [
        "LIVEKIT_URL",
        "LIVEKIT_API_KEY",
        "LIVEKIT_API_SECRET",
        "LIVEKIT_SIP_INBOUND_TRUNK_ID",
      ],
      "LiveKit URL, API credentials, or inbound trunk are not configured",
      "all"
    ),
    livekitTwilio: checkEnv(
      ["LIVEKIT_SIP_OUTBOUND_TRUNK_TWILIO_ID"],
      "LiveKit Twilio outbound trunk is not configured",
      "all"
    ),
    telnyx: checkEnv(
      ["TELNYX_API_KEY", "TELNYX_CONNECTION_ID"],
      "Telnyx credentials or connection are not configured",
      "all"
    ),
    livekitTelnyx: checkEnv(
      ["LIVEKIT_SIP_OUTBOUND_TRUNK_TELNYX_ID"],
      "LiveKit Telnyx outbound trunk is not configured",
      "all"
    ),
    smithery: checkEnv(["SMITHERY_API_KEY"], "Smithery API key is not configured"),
  };

  const requiredChecks = [
    checks.db,
    checks.redis,
    checks.s3,
    checks.stripe,
    checks.twilio,
    checks.livekit,
    checks.livekitTwilio,
  ];
  const ready = requiredChecks.every((check) => check.status === "ok");
  return { ready, checks };
}

async function checkDb(): Promise<ReadinessCheck> {
  try {
    await withTimeout(prisma.$queryRawUnsafe("SELECT 1"), 2000);
    return { status: "ok" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkRedis(): Promise<ReadinessCheck> {
  try {
    await withTimeout(redisConnection.ping(), 2000);
    return { status: "ok" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function checkEnv(
  names: string[],
  message: string,
  mode: "any" | "all" = "any"
): ReadinessCheck {
  const isConfigured =
    mode === "all"
      ? names.every((name) => Boolean(process.env[name]?.trim()))
      : names.some((name) => Boolean(process.env[name]?.trim()));

  return isConfigured ? { status: "ok" } : { status: "not_configured", message };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("readiness check timed out")), timeoutMs);
    }),
  ]);
}
