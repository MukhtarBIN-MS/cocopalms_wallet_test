// apps/api/src/services/googleWallet.ts
import { GoogleAuth } from "google-auth-library";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { env } from "../config/env";

const API_BASE = "https://walletobjects.googleapis.com/walletobjects/v1";
// IMPORTANT: Issuer scope is enough (and recommended) for server-to-server
const SCOPES = ["https://www.googleapis.com/auth/wallet_object.issuer"];

// ---------- Load service account JSON ----------
function loadServiceAccountJSON(): {
  client_email: string;
  private_key: string;
} {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) throw new Error("GOOGLE_APPLICATION_CREDENTIALS not set");
  const abs = path.isAbsolute(keyFile)
    ? keyFile
    : path.resolve(process.cwd(), keyFile);
  if (!fs.existsSync(abs))
    throw new Error(`Service account JSON not found at ${abs}`);
  const json = JSON.parse(fs.readFileSync(abs, "utf8"));
  if (!json.client_email || !json.private_key) {
    throw new Error("Service account JSON missing client_email/private_key");
  }
  return { client_email: json.client_email, private_key: json.private_key };
}

// ---------- Build one authorized client and reuse it ----------
const { client_email, private_key } = loadServiceAccountJSON();
const auth = new GoogleAuth({
  credentials: { client_email, private_key },
  scopes: SCOPES,
});
const clientPromise = auth.getClient();

// small helper to always use the same client
async function request<T = any>(opts: {
  url: string;
  method?: string;
  data?: any;
}) {
  const client = await clientPromise;
  // one-time token peek (to prove we have one)
  if ((request as any)._peeked !== true) {
    const tok = await client.getAccessToken();
    const t = typeof tok === "string" ? tok : tok?.token;
    console.log(
      "[GW] accessToken prefix:",
      t ? String(t).slice(0, 16) : "<none>"
    );
    (request as any)._peeked = true;
  }
  return client.request<T>(opts as any);
}

// ---------- Utils ----------
function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
async function safeText(res: any): Promise<string> {
  try {
    if (res?.data && typeof res.data === "string") return res.data;
    if (res?.data && typeof res.data === "object")
      return JSON.stringify(res.data);
    return String(res?.data ?? "");
  } catch {
    return "<no-body>";
  }
}

// ---------- Save JWT ----------
function buildSaveJwt(payload: { giftCardObjects: any[] }) {
  const { client_email, private_key } = loadServiceAccountJSON();
  const claims = {
    iss: client_email,
    aud: "google",
    typ: "savetowallet",
    payload,
  };
  return jwt.sign(claims, private_key, { algorithm: "RS256" });
}

// ---------- Create GiftCardClass ----------
export async function createGiftCardClass(
  programName: string
): Promise<{ classId: string }> {
  if (env.GW_ENABLE_MOCK) {
    return { classId: `${env.GW_CLASS_PREFIX}.${slug(programName)}-class` };
  }

  const classId = `${env.GW_ISSUER_ID}.${env.GW_CLASS_PREFIX}-${slug(
    programName
  )}`;
  const giftCardClass = {
    id: classId,
    issuerName: "COCOPALMS",
    reviewStatus: "underReview",
    programName, // shows near top (e.g., “Bronze 10%” if you set programName like that)
    hexBackgroundColor: "#00AFAF",
    logo: {
      sourceUri: {
        uri: "https://plus.unsplash.com/premium_photo-1675435644687-562e8042b9db?q=80&w=1049&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      contentDescription: { defaultValue: { language: "en", value: "Logo" } },
    },
    heroImage: {
      sourceUri: {
        uri: "https://plus.unsplash.com/premium_photo-1675435644687-562e8042b9db?q=80&w=1049&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      contentDescription: {
        defaultValue: { language: "en", value: "Hero image" },
      },
    },
    textModulesData: [
      { header: "Bronze 10%", body: "Special discount tier" }, // appears in details
    ],
  };

  // 1) Try GET (exists?)
  try {
    await request({
      url: `${API_BASE}/giftCardClass/${classId}`,
      method: "GET",
    });
    return { classId };
  } catch (err: any) {
    const status = err?.response?.status;
    if (status !== 404) {
      const txt = await safeText(err?.response);
      throw new Error(`giftCardClass GET failed (${status}): ${txt}`);
    }
  }

  // 2) Create
  try {
    await request({
      url: `${API_BASE}/giftCardClass`,
      method: "POST",
      data: giftCardClass,
    });
    return { classId };
  } catch (err: any) {
    const status = err?.response?.status;
    const txt = await safeText(err?.response);
    if (status === 409) return { classId };
    throw new Error(`giftCardClass POST failed (${status}): ${txt}`);
  }
}

// ---------- Create GiftCardObject ----------
export async function createGiftCardObject(opts: {
  classId: string;
  userFullName: string;
  userEmail: string;
}): Promise<{ objectId: string; saveLink: string }> {
  if (env.GW_ENABLE_MOCK) {
    const objectId = `${opts.classId}.${slug(opts.userEmail)}`;
    return {
      objectId,
      saveLink: `https://wallet.google/mock/save/${objectId}`,
    };
  }

  const unique = `${slug(opts.userEmail)}-${Date.now()}`;
  const objectId = `${env.GW_ISSUER_ID}.${unique}`;

  // Minimal GiftCardObject (GiftCard requires cardNumber)
  const giftCardObject = {
    id: objectId,
    classId: opts.classId,
    state: "active",

    // GiftCard requires a number; keep using what you had
    cardNumber: `C${Date.now()}`,
    // pin: "1234",

    barcode: { type: "qrCode", value: objectId },

    // These show mainly in Details for GiftCard
    textModulesData: [
      { header: "Customer", body: opts.userFullName },
      { header: "ID", body: `C${Date.now()}` },
      { header: "MEMBER SINCE", body: "2025" },
    ],
    imageModulesData: [
      {
        mainImage: {
          sourceUri: {
            uri: "https://plus.unsplash.com/premium_photo-1675435644687-562e8042b9db?q=80&w=1049&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          contentDescription: {
            defaultValue: { language: "en", value: "Coffee" },
          },
        },
      },
    ],
  };

  try {
    await request({
      url: `${API_BASE}/giftCardObject`,
      method: "POST",
      data: giftCardObject,
    });
  } catch (err: any) {
    const status = err?.response?.status;
    if (status !== 409) {
      const txt = await safeText(err?.response);
      throw new Error(`giftCardObject POST failed (${status}): ${txt}`);
    }
  }

  const saveJwt = buildSaveJwt({ giftCardObjects: [giftCardObject] });
  const saveLink = `https://pay.google.com/gp/v/save/${encodeURIComponent(
    saveJwt
  )}`;

  return { objectId, saveLink };
}
