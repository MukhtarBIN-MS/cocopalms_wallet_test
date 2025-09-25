// scripts/wallet-debug.js
const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const ISSUER_ID = process.env.GW_ISSUER_ID;
if (!ISSUER_ID) {
  console.error('FATAL: GW_ISSUER_ID not set');
  process.exit(1);
}
const CLASS_PREFIX = process.env.GW_CLASS_PREFIX || 'demo';
const CREDS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!CREDS_PATH) {
  console.error('FATAL: GOOGLE_APPLICATION_CREDENTIALS not set');
  process.exit(1);
}

const BASE = 'https://walletobjects.googleapis.com/walletobjects/v1';
const SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer';

(async () => {
  // 1) Auth client with **issuer scope**
  const auth = new GoogleAuth({
    keyFile: CREDS_PATH,
    scopes: [SCOPE],
  });

  // Show the Authorization header we’ll actually send
  const client = await auth.getClient();
  const headers = await client.getRequestHeaders(BASE);
  console.log('Auth header present?', !!headers.Authorization);

  const http = {
    request: (opts) => client.request(opts),
  };

  const classId = `${ISSUER_ID}.${CLASS_PREFIX}-debug-class`;

  // 2) Ensure class exists
  try {
    await http.request({ url: `${BASE}/giftCardClass/${classId}`, method: 'GET' });
    console.log('✅ Class already exists:', classId);
  } catch (err) {
    if (err.response?.status === 404) {
      const payload = {
        id: classId,
        issuerName: 'Debug Issuer',
        reviewStatus: 'underReview',
        programName: 'Debug Program',
      };
      const resp = await http.request({
        url: `${BASE}/giftCardClass`,
        method: 'POST',
        data: payload,
      });
      console.log('✅ Class created:', resp.status, classId);
    } else {
      console.error('❌ Class GET failed:', err.response?.status, err.response?.data || err.message);
      process.exit(1);
    }
  }

  // 3) Create an object
  const unique = `debug-${Date.now()}`;
  const objectId = `${ISSUER_ID}.${unique}`;
  const objectPayload = {
    id: objectId,
    classId: opts.classId,
    state: 'active',
    cardNumber: objectId, 
    barcode: { type: 'qrCode', value: objectId },
    textModulesData: [{ header: 'Holder', body: opts.userFullName }],
  };

  try {
    const resp = await http.request({
      url: `${BASE}/giftCardObject`,
      method: 'POST',
      data: objectPayload,
    });
    console.log('✅ Object created:', resp.status, objectId);
  } catch (err) {
    if (err.response?.status === 409) {
      console.log('ℹ️ Object already exists:', objectId);
    } else {
      console.error('❌ Object POST failed:', err.response?.status, err.response?.data || err.message);
      process.exit(1);
    }
  }

  // 4) Build Save-to-Wallet JWT (use creds file to sign)
  const creds = require(CREDS_PATH);
  const claims = {
    iss: creds.client_email,
    aud: 'google',
    typ: 'savetowallet',
    payload: { giftCardObjects: [objectPayload] },
  };
  const saveJwt = jwt.sign(claims, creds.private_key, { algorithm: 'RS256' });
  const saveUrl = `https://pay.google.com/gp/v/save/${encodeURIComponent(saveJwt)}`;

  console.log('\n✅ SAVE LINK (open in a browser with a TEST user signed in):');
  console.log(saveUrl);
})().catch((e) => {
  console.error('FATAL:', e.response?.data || e.message || e);
  process.exit(1);
});
