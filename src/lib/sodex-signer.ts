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
}

function getChainId(): number {
  return process.env.SODEX_ENV === "mainnet" ? MAINNET_CHAIN_ID : TESTNET_CHAIN_ID;
}

export function hasSigningCredentials(): boolean {
  return !!(
    process.env.SODEX_API_KEY_NAME &&
    process.env.SODEX_API_KEY_PRIVATE_KEY &&
    process.env.SODEX_ACCOUNT_ID
  );
}

export async function signSoDexOrder(
  order: OrderParams
): Promise<{ signature: Hex; nonce: string } | null> {
  const privateKey = process.env.SODEX_API_KEY_PRIVATE_KEY;
  if (!privateKey) return null;

  try {
    const account = privateKeyToAccount(
      (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as Hex
    );

    const nonce = Date.now().toString();

    const payload = JSON.stringify({
      accountID: order.accountId,
      symbolID: order.symbolId,
      orders: [
        {
          side: order.side,
          size: order.size,
          price: order.price,
          reduceOnly: order.reduceOnly,
        },
      ],
    });

    const payloadHash = keccak256(toBytes(payload));

    const signature = await account.signTypedData({
      domain: {
        name: "futures",
        version: "1",
        chainId: getChainId(),
        verifyingContract: "0x0000000000000000000000000000000000000000",
      },
      types: {
        ExchangeAction: [
          { name: "payloadHash", type: "bytes32" },
          { name: "nonce", type: "uint256" },
        ],
      },
      primaryType: "ExchangeAction",
      message: {
        payloadHash,
        nonce: BigInt(nonce),
      },
    });

    return {
      signature: `0x01${signature.slice(2)}` as Hex,
      nonce,
    };
  } catch {
    return null;
  }
}
