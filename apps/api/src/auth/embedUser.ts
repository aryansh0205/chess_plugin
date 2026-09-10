import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { User } from "../models/User.js";

const SALT_ROUNDS = 10;

function isDuplicateKey(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: unknown }).code === 11000,
  );
}

export type EmbedUserBody = Record<string, unknown>;

/**
 * Upsert a plugin Mongo user from a Relmes iframe handshake.
 *
 * Identity is always `{ serverId, relmesUserId }` (relm + Relmes account),
 * not the display name from postMessage. Copy this helper into sheets / exl /
 * calendar / code so every plugin shares the same contract:
 *   POST /api/auth/embed  { id | userId, serverId, email?, fullname?, username? }
 */
export async function findOrCreateEmbedUser(body: EmbedUserBody) {
  const serverId = String(body.serverId ?? "").trim();
  const relmesId = String(body.id ?? body.userId ?? "").trim();
  const name = String(body.name ?? body.fullname ?? body.username ?? "").trim();
  const contactEmail = String(body.email ?? "").trim().toLowerCase();

  if (!serverId || !relmesId) return null;

  const resolvedEmail = contactEmail || `relmes+${serverId}+${relmesId}@embed.local`;
  const resolvedName = name || contactEmail || "Relmes user";
  const filter = { serverId, relmesUserId: relmesId };

  let doc = await User.findOne(filter);

  if (!doc) {
    const passwordHash = await bcrypt.hash(randomUUID(), SALT_ROUNDS);
    try {
      doc = await User.create({
        email: resolvedEmail,
        name: resolvedName,
        passwordHash,
        serverId,
        relmesUserId: relmesId,
      });
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
      doc = await User.findOne(filter);
      if (!doc) throw err;
    }
  }

  let dirty = false;
  if (resolvedName && doc.name !== resolvedName) {
    doc.name = resolvedName;
    dirty = true;
  }
  if (contactEmail && doc.email !== contactEmail) {
    doc.email = contactEmail;
    dirty = true;
  }
  if (dirty) await doc.save();
  return doc;
}
