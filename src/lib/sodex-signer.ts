import { privateKeyToAccount } from "viem/accounts";
import { keccak256, toBytes, type Hex } from "viem";

const TESTNET_CHAIN_ID = 138565;
const MAINNET_CHAIN_ID = 286623;

export interface OrderParams {
  accountId: number;
  symbolId: number;
  side: "buy" | "sell";
  size: string;
  price: string;
  reduceOnly: boolean;
  clOrdID?: string;
}

export interface SignedOrderRequest {
  body: string;
  headers: Record<string, string>;
}

export function getChainId(): number {
  return process.env.SODEX_ENV === "mainnet" ? MAINNET_CHAIN_ID : TESTNET_CHAIN_ID;
}

export function hasSigningCredentials(): boolean {
  return !!(
    process.env.SODEX_API_KEY_NAME &&
    process.env.SODEX_API_KEY_PRIVATE_KEY &&
    process.env.SODEX_ACCOUNT_ID
  );
}

/** Strip trailing zeros — SoDEX rejects "0.4060", accepts "0.406" */
function normalizeDecimal(value: string): string {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n.toString() : value;
}

/**
 * Build and sign a SoDEX perps order per the official SDK spec:
 * 1. Signing payload = {"type":"newOrder","params":{...}} (compact JSON, exact field order)
 * 2. payloadHash = keccak256(signing payload)
 * 3. EIP-712 sign ExchangeAction(bytes32 payloadHash, uint64 nonce),
 *    domain name "futures", verifyingContract 0x0
 * 4. X-API-Sign = 0x01 + r + s + v(0/1)
 * 5. HTTP body = params only (same field order)
 */
export async function signSoDexOrder(order: OrderParams): Promise<SignedOrderRequest | null> {
  const privateKey = process.env.SODEX_API_KEY_PRIVATE_KEY;
  const apiKeyName = process.env.SODEX_API_KEY_NAME_LABEL || "SODEX_API_KEY";
  if (!privateKey) return null;

  try {
    const account = privateKeyToAccount(
      (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as Hex
    );

    const nonce = Date.now().toString();
    const chainId = getChainId();

    // Exact field order required by server-side re-marshaling:
    // clOrdID, modifier, side, type, timeInForce, price, quantity, reduceOnly, positionSide
    const params = {
      accountID: order.accountId,
      symbolID: order.symbolId,
      orders: [
        {
          clOrdID: order.clOrdID ?? `upside-${Date.now()}`,
          modifier: 1,
          side: order.side === "buy" ? 1 : 2,
          type: 1, // limit
          timeInForce: 1, // GTC
          price: normalizeDecimal(order.price),
          quantity: normalizeDecimal(order.size),
          reduceOnly: order.reduceOnly,
          positionSide: 1,
        },
      ],
    };

    const signingPayload = JSON.stringify({ type: "newOrder", params });
    const payloadHash = keccak256(toBytes(signingPayload));

    const signature = await account.signTypedData({
      domain: {
        name: "futures",
        version: "1",
        chainId,
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

    // Convert v from 27/28 to 0/1, prepend 0x01 signature-type byte
    const raw = signature.slice(2);
    const rs = raw.slice(0, 128);
    const v = parseInt(raw.slice(128, 130), 16);
    const vAdj = v >= 27 ? v - 27 : v;
    const apiSign = `0x01${rs}${vAdj.toString(16).padStart(2, "0")}`;

    return {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiKeyName,
        "X-API-Sign": apiSign,
        "X-API-Nonce": nonce,
        "X-API-Chain": String(chainId),
      },
    };
  } catch {
    return null;
  }
}
