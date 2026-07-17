// SoDEX order test using official SDK signing spec
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, toBytes } from "viem";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const CHAIN_ID = 138565; // testnet
const accountId = parseInt(env.SODEX_ACCOUNT_ID, 10);
const pk = env.SODEX_API_KEY_PRIVATE_KEY.startsWith("0x")
  ? env.SODEX_API_KEY_PRIVATE_KEY
  : `0x${env.SODEX_API_KEY_PRIVATE_KEY}`;
const account = privateKeyToAccount(pk);

console.log("signer address:", account.address);
console.log("accountId:", accountId);

// Exact field order: clOrdID, modifier, side, type, timeInForce, price, quantity,
// funds, stopPrice, stopType, triggerType, reduceOnly, positionSide
const orderObj = {
  clOrdID: `upside-${Date.now()}`,
  modifier: 1,
  side: 2, // sell to reduce long
  type: 1, // limit
  timeInForce: 1, // GTC
  price: "63800",
  quantity: "0.0022",
  reduceOnly: true,
  positionSide: 1,
};

const params = {
  accountID: accountId,
  symbolID: 1,
  orders: [orderObj],
};

const signingPayload = JSON.stringify({ type: "newOrder", params });
const httpBody = JSON.stringify(params);
const payloadHash = keccak256(toBytes(signingPayload));
const nonce = Date.now().toString();

const signature = await account.signTypedData({
  domain: {
    name: "futures",
    version: "1",
    chainId: CHAIN_ID,
    verifyingContract: "0x0000000000000000000000000000000000000000",
  },
  types: {
    ExchangeAction: [
      { name: "payloadHash", type: "bytes32" },
      { name: "nonce", type: "uint64" },
    ],
  },
  primaryType: "ExchangeAction",
  message: { payloadHash, nonce: BigInt(nonce) },
});

// v: 27/28 -> 0/1, prepend 0x01
const raw = signature.slice(2);
const rs = raw.slice(0, 128);
const v = parseInt(raw.slice(128, 130), 16);
const vAdj = v >= 27 ? v - 27 : v;
const apiSign = `0x01${rs}${vAdj.toString(16).padStart(2, "0")}`;

const res = await fetch("https://testnet-gw.sodex.dev/api/v1/perps/trade/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-Key": "SODEX_API_KEY",
    "X-API-Sign": apiSign,
    "X-API-Nonce": nonce,
    "X-API-Chain": String(CHAIN_ID),
  },
  body: httpBody,
});

const text = await res.text();
console.log("->", res.status, text.slice(0, 400));
