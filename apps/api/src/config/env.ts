import "dotenv/config";

function required(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URI: required("MONGO_URI"),
  JWT_SECRET: required("JWT_SECRET"),
  ADMIN_EMAIL: required("ADMIN_EMAIL"),
  ADMIN_PASSWORD: required("ADMIN_PASSWORD"),
  GW_ENABLE_MOCK: process.env.GW_ENABLE_MOCK === "1",
  GW_ISSUER_ID: process.env.GW_ISSUER_ID ?? "",
  GW_CLASS_PREFIX: process.env.GW_CLASS_PREFIX ?? "cocopalms",
  GW_SA_EMAIL: process.env.GW_SA_EMAIL ?? "",
  GW_SA_PRIVATE_KEY: process.env.GW_SA_PRIVATE_KEY ?? ""
};
