import net from "node:net";

const CACHE_WINDOW_MS = 15_000;

let cachedResult:
  | {
      checkedAt: number;
      reachable: boolean;
    }
  | undefined;
let inFlightCheck: Promise<boolean> | undefined;

function parseDatabaseTarget() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(databaseUrl);
    const protocol = parsed.protocol.replace(":", "");

    if (!["postgres", "postgresql"].includes(protocol)) {
      return null;
    }

    return {
      host: parsed.hostname || "localhost",
      port: Number(parsed.port || "5432"),
    };
  } catch {
    return null;
  }
}

async function checkTcpReachability(host: string, port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host, port });

    const finalize = (reachable: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(reachable);
    };

    socket.setTimeout(750);
    socket.once("connect", () => finalize(true));
    socket.once("timeout", () => finalize(false));
    socket.once("error", () => finalize(false));
  });
}

export async function isDatabaseReachable() {
  const target = parseDatabaseTarget();

  if (!target) {
    return false;
  }

  if (
    cachedResult &&
    Date.now() - cachedResult.checkedAt < CACHE_WINDOW_MS
  ) {
    return cachedResult.reachable;
  }

  if (!inFlightCheck) {
    inFlightCheck = checkTcpReachability(target.host, target.port).then((reachable) => {
      cachedResult = {
        checkedAt: Date.now(),
        reachable,
      };
      inFlightCheck = undefined;
      return reachable;
    });
  }

  return inFlightCheck;
}
