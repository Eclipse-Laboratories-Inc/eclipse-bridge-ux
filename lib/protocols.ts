import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";

const WHIRLPOOL_PROGRAM_ID = "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc";
const SOLAR_PROGRAM_IDS = [
  "CLK8pJyTV17Mwq3MrgbbojEiVXcmrMYC3J59JC9xhgNQ",
  "CLsiWisG9Ek7dFgD8ENYtxLBbMEVxB64M3wD4f2XuZSn",
];
const INVARIANT_PROGRAM_ID = "iNvTyprs4TX8m6UeUEkeqDFjAL9zRCRWcexK9Sd4WEU";
const SAVE_PROGRAM_ID = "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo";
const ALLDOMAINS_PROGRAM_ID = "ALTNSZ46uaAUU7XUV6awvdorLGqAsPwa9shm7h4uP2FK";

/** Save obligation layout matches the Solend account: owner pubkey at byte 42, deposit and borrow counts at byte 202, account size 1300. */
const SAVE_OWNER_OFFSET = 42;
const ALLDOMAINS_OWNER_OFFSET = 40;
const SAVE_COUNTS_OFFSET = 202;
const SAVE_ACCOUNT_SIZE = 1300;

const CHECK_TIMEOUT_MS = 12_000;
const FINDING_LIMIT = 4;
const INVARIANT_POSITION_LIMIT = 32;

const MINT_NAMES: Record<string, string> = {
  So11111111111111111111111111111111111111112: "ETH",
  EqRSt9aUDMKYKhzd1DGMderr3KNp29VZH3x5P7LFTC8m: "USDC",
};

export type EmptyAccount = {
  address: string;
  mint: string;
  programId: string;
  lamports: number;
};

export type ProtocolStatus = "pending" | "checked" | "unavailable";

export type ProtocolFinding = {
  label: string;
  detail: string;
  account?: string;
};

export type ProtocolReport = {
  id: string;
  name: string;
  status: ProtocolStatus;
  summary: string;
  findings: ProtocolFinding[];
  attention: boolean;
  href?: string;
  hrefLabel?: string;
};

export const PROTOCOL_CATALOG: { id: string; name: string }[] = [
  { id: "spl-token", name: "SPL Token" },
  { id: "token-2022", name: "Token-2022" },
  { id: "orca", name: "Orca" },
  { id: "solar", name: "Solar" },
  { id: "invariant", name: "Invariant" },
  { id: "save", name: "Save" },
  { id: "alldomains", name: "AllDomains" },
];

type TokenRow = {
  address: string;
  mint: string;
  programId: string;
  amount: bigint;
  decimals: number;
  frozen: boolean;
  lamports: number;
  owner: string;
};

export function formatEclipseEth(lamports: number): string {
  if (!Number.isSafeInteger(lamports) || lamports < 0) {
    throw new Error("Balance is outside the range this page can display.");
  }
  const whole = Math.floor(lamports / 1_000_000_000);
  const fraction = (lamports % 1_000_000_000)
    .toString()
    .padStart(9, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

export function protocolPlaceholders(summary: string): ProtocolReport[] {
  return PROTOCOL_CATALOG.map((item) => ({
    id: item.id,
    name: item.name,
    status: "pending",
    summary,
    findings: [],
    attention: false,
  }));
}

function checked(
  id: string,
  name: string,
  summary: string,
  findings: ProtocolFinding[],
  attention: boolean,
  link?: { href: string; hrefLabel: string },
): ProtocolReport {
  return {
    id,
    name,
    status: "checked",
    summary,
    findings: findings.slice(0, FINDING_LIMIT),
    attention,
    href: link?.href,
    hrefLabel: link?.hrefLabel,
  };
}

function unavailable(id: string, name: string, error: unknown): ProtocolReport {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  const summary =
    lower.includes("too long") || lower.includes("timed out")
      ? "The check timed out."
      : lower.includes("429") || lower.includes("too many")
        ? "The network is busy."
        : "This program did not respond.";
  return {
    id,
    name,
    status: "unavailable",
    summary,
    findings: [],
    attention: false,
  };
}

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out.`)),
      CHECK_TIMEOUT_MS,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function u32(data: Uint8Array, offset: number): number {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(
    offset,
    true,
  );
}

function u128(data: Uint8Array, offset: number): bigint {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const lo = view.getBigUint64(offset, true);
  const hi = view.getBigUint64(offset + 8, true);
  return lo + (hi << BigInt(64));
}

function countPhrase(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function mintLabel(mint: string): string {
  return MINT_NAMES[mint] ?? mint;
}

function safeLamports(value: number): number | null {
  if (!Number.isSafeInteger(value) || value < 0) return null;
  return value;
}

async function accountsAt(
  connection: Connection,
  keys: PublicKey[],
): Promise<(AccountInfo<Buffer> | null)[]> {
  const found: (AccountInfo<Buffer> | null)[] = [];
  for (let index = 0; index < keys.length; index += 100) {
    const slice = keys.slice(index, index + 100);
    const batch = await connection.getMultipleAccountsInfo(slice, "confirmed");
    for (let item = 0; item < batch.length; item += 1) found.push(batch[item]);
  }
  return found;
}

async function tokenRows(
  connection: Connection,
  owner: PublicKey,
  programId: PublicKey,
): Promise<TokenRow[]> {
  const response = await connection.getParsedTokenAccountsByOwner(owner, {
    programId,
  });
  const rows: TokenRow[] = [];
  for (let index = 0; index < response.value.length; index += 1) {
    const account = response.value[index];
    const info = (
      account.account.data as {
        parsed?: {
          info?: {
            mint?: string;
            owner?: string;
            state?: string;
            tokenAmount?: { amount?: string; decimals?: number };
          };
        };
      }
    ).parsed?.info;
    const lamports = safeLamports(account.account.lamports);
    if (!info?.mint || lamports === null) continue;
    rows.push({
      address: account.pubkey.toBase58(),
      mint: info.mint,
      programId: programId.toBase58(),
      amount: BigInt(info.tokenAmount?.amount ?? "0"),
      decimals: info.tokenAmount?.decimals ?? 0,
      frozen: info.state === "frozen",
      lamports,
      owner: info.owner ?? "",
    });
  }
  return rows;
}

function tokenReport(
  id: string,
  name: string,
  owner: string,
  rows: TokenRow[],
): { report: ProtocolReport; empties: EmptyAccount[] } {
  const empties: EmptyAccount[] = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (row.amount !== BigInt(0) || row.frozen || row.owner !== owner) continue;
    empties.push({
      address: row.address,
      mint: row.mint,
      programId: row.programId,
      lamports: row.lamports,
    });
  }
  const rent = empties.reduce((sum, account) => sum + account.lamports, 0);
  const summary =
    rows.length === 0
      ? "No accounts"
      : empties.length === 0
        ? rows.length === 1
          ? "1 account, holding tokens"
          : `${countPhrase(rows.length, "account")}, all holding tokens`
        : `${countPhrase(empties.length, "empty account")}, ${formatEclipseEth(rent)} ETH`;
  return {
    report: checked(
      id,
      name,
      summary,
      empties.map((account) => ({
        label: mintLabel(account.mint),
        detail: `${formatEclipseEth(account.lamports)} ETH`,
        account: account.address,
      })),
      false,
    ),
    empties,
  };
}

function positionNfts(rows: TokenRow[]): TokenRow[] {
  return rows.filter((row) => row.decimals === 0 && row.amount === BigInt(1));
}

function bundleSlots(bitmap: Uint8Array): number[] {
  const slots: number[] = [];
  for (let byte = 0; byte < bitmap.length; byte += 1) {
    for (let bit = 0; bit < 8; bit += 1) {
      if ((bitmap[byte] & (1 << bit)) !== 0) slots.push(byte * 8 + bit);
    }
  }
  return slots;
}

async function scanOrca(
  connection: Connection,
  rows: TokenRow[],
): Promise<ProtocolReport> {
  const nfts = positionNfts(rows);
  if (nfts.length === 0) return checked("orca", "Orca", "Nothing open", [], false);

  const program = new PublicKey(WHIRLPOOL_PROGRAM_ID);
  const derived = nfts.map((nft) => {
    const mint = new PublicKey(nft.mint);
    const [position] = PublicKey.findProgramAddressSync(
      [new TextEncoder().encode("position"), mint.toBytes()],
      program,
    );
    const [bundle] = PublicKey.findProgramAddressSync(
      [new TextEncoder().encode("position_bundle"), mint.toBytes()],
      program,
    );
    return { nft, mint, position, bundle };
  });
  const accounts = await accountsAt(
    connection,
    derived.flatMap((item) => [item.position, item.bundle]),
  );
  const findings: ProtocolFinding[] = [];
  let open = 0;
  let empty = 0;
  let bundles = 0;
  const bundled: { mint: PublicKey; slots: number[] }[] = [];
  for (let index = 0; index < derived.length; index += 1) {
    const position = accounts[index * 2];
    const bundle = accounts[index * 2 + 1];
    if (position && position.owner.equals(program) && position.data.length >= 88) {
      const mint = new PublicKey(position.data.subarray(40, 72)).toBase58();
      if (mint === derived[index].nft.mint) {
        const liquidity = u128(position.data, 72);
        if (liquidity > BigInt(0)) open += 1;
        else empty += 1;
        findings.push({
          label: derived[index].position.toBase58(),
          detail: liquidity > BigInt(0) ? "Open position" : "No liquidity",
          account: derived[index].position.toBase58(),
        });
        continue;
      }
    }
    if (!bundle || !bundle.owner.equals(program) || bundle.data.length < 72) continue;
    const mint = new PublicKey(bundle.data.subarray(8, 40)).toBase58();
    if (mint !== derived[index].nft.mint) continue;
    const slots = bundleSlots(bundle.data.subarray(40, 72));
    bundles += 1;
    findings.push({
      label: derived[index].bundle.toBase58(),
      detail: slots.length === 0 ? "Empty bundle" : countPhrase(slots.length, "bundled position"),
      account: derived[index].bundle.toBase58(),
    });
    if (slots.length > 0 && slots.length <= 8) {
      bundled.push({ mint: derived[index].mint, slots });
    } else {
      open += slots.length;
    }
  }

  for (let index = 0; index < bundled.length; index += 1) {
    const item = bundled[index];
    const addresses = item.slots.map((slot) => {
      const [position] = PublicKey.findProgramAddressSync(
        [
          new TextEncoder().encode("bundled_position"),
          item.mint.toBytes(),
          new TextEncoder().encode(String(slot)),
        ],
        program,
      );
      return position;
    });
    const positions = await accountsAt(connection, addresses);
    for (let slot = 0; slot < positions.length; slot += 1) {
      const position = positions[slot];
      if (!position || !position.owner.equals(program) || position.data.length < 88) {
        open += 1;
        continue;
      }
      if (u128(position.data, 72) > BigInt(0)) open += 1;
      else empty += 1;
    }
  }

  if (open === 0 && empty === 0 && bundles === 0) {
    return checked("orca", "Orca", "Nothing open", [], false);
  }
  const parts = [
    open > 0 ? countPhrase(open, "open position") : "",
    empty > 0 ? countPhrase(empty, "empty position") : "",
    bundles > 0 ? countPhrase(bundles, "position bundle") : "",
  ].filter(Boolean);
  return checked("orca", "Orca", parts.join(", "), findings, true, {
    href: "https://close-position.orca.so",
    hrefLabel: "Close on Orca",
  });
}

async function scanSolar(
  connection: Connection,
  rows: TokenRow[],
): Promise<ProtocolReport> {
  const nfts = positionNfts(rows);
  if (nfts.length === 0) return checked("solar", "Solar", "Nothing open", [], false);

  const programs = SOLAR_PROGRAM_IDS.map((id) => new PublicKey(id));
  const derived = nfts.flatMap((nft) => {
    const mint = new PublicKey(nft.mint);
    return programs.map((program) => {
      const [position] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode("position"), mint.toBytes()],
        program,
      );
      return { nft, position, program };
    });
  });
  const accounts = await accountsAt(
    connection,
    derived.map((item) => item.position),
  );
  const findings: ProtocolFinding[] = [];
  let open = 0;
  let empty = 0;
  for (let index = 0; index < accounts.length; index += 1) {
    const account = accounts[index];
    const program = derived[index].program;
    if (!account || !account.owner.equals(program) || account.data.length < 97) continue;
    const mint = new PublicKey(account.data.subarray(9, 41)).toBase58();
    if (mint !== derived[index].nft.mint) continue;
    const liquidity = u128(account.data, 81);
    if (liquidity > BigInt(0)) open += 1;
    else empty += 1;
    findings.push({
      label: derived[index].position.toBase58(),
      detail: liquidity > BigInt(0) ? "Open position" : "No liquidity",
      account: derived[index].position.toBase58(),
    });
  }
  if (open === 0 && empty === 0) {
    return checked("solar", "Solar", "Nothing open", [], false);
  }
  const parts = [
    open > 0 ? countPhrase(open, "open position") : "",
    empty > 0 ? countPhrase(empty, "empty position") : "",
  ].filter(Boolean);
  return checked("solar", "Solar", parts.join(", "), findings, true, {
    href: "https://eclipse.solarstudios.co/portfolio",
    hrefLabel: "Open Solar",
  });
}

async function scanInvariant(
  connection: Connection,
  owner: PublicKey,
): Promise<ProtocolReport> {
  const program = new PublicKey(INVARIANT_PROGRAM_ID);
  const [list] = PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("positionlistv1"), owner.toBuffer()],
    program,
  );
  const account = await connection.getAccountInfo(list, "confirmed");
  if (!account || !account.owner.equals(program) || account.data.length < 12) {
    return checked("invariant", "Invariant", "Nothing open", [], false);
  }
  const head = u32(account.data, 8);
  if (head === 0) return checked("invariant", "Invariant", "Nothing open", [], false);

  const limit = Math.min(head, INVARIANT_POSITION_LIMIT);
  const addresses: PublicKey[] = [];
  for (let index = 0; index < limit; index += 1) {
    const counter = new Uint8Array(4);
    new DataView(counter.buffer).setInt32(0, index, true);
    const [position] = PublicKey.findProgramAddressSync(
      [new TextEncoder().encode("positionv1"), owner.toBuffer(), counter],
      program,
    );
    addresses.push(position);
  }
  const accounts = await accountsAt(connection, addresses);
  const findings: ProtocolFinding[] = [];
  let open = 0;
  let empty = 0;
  for (let index = 0; index < accounts.length; index += 1) {
    const position = accounts[index];
    if (!position || !position.owner.equals(program) || position.data.length < 104) {
      continue;
    }
    if (!new PublicKey(position.data.subarray(8, 40)).equals(owner)) continue;
    const liquidity = u128(position.data, 88);
    if (liquidity > BigInt(0)) open += 1;
    else empty += 1;
    findings.push({
      label: addresses[index].toBase58(),
      detail: liquidity > BigInt(0) ? "Open position" : "No liquidity",
      account: addresses[index].toBase58(),
    });
  }
  if (open === 0 && empty === 0) {
    return checked("invariant", "Invariant", "Nothing open", [], false);
  }
  const parts = [
    open > 0 ? countPhrase(open, "open position") : "",
    empty > 0 ? countPhrase(empty, "empty position") : "",
    head > limit ? `showing ${limit} of ${head}` : "",
  ].filter(Boolean);
  return checked("invariant", "Invariant", parts.join(", "), findings, true, {
    href: "https://eclipse.invariant.app",
    hrefLabel: "Open Invariant",
  });
}

async function scanAllDomains(
  connection: Connection,
  owner: PublicKey,
): Promise<ProtocolReport> {
  const accounts = await connection.getProgramAccounts(
    new PublicKey(ALLDOMAINS_PROGRAM_ID),
    {
      commitment: "confirmed",
      dataSlice: { offset: 0, length: 0 },
      filters: [
        { memcmp: { offset: ALLDOMAINS_OWNER_OFFSET, bytes: owner.toBase58() } },
      ],
    },
  );
  if (accounts.length === 0) {
    return checked("alldomains", "AllDomains", "No names", [], false);
  }
  let rent = 0;
  const findings: ProtocolFinding[] = [];
  for (let index = 0; index < accounts.length; index += 1) {
    const account = accounts[index];
    const lamports = safeLamports(account.account.lamports);
    if (lamports !== null) rent += lamports;
    findings.push({
      label: account.pubkey.toBase58(),
      detail: lamports === null ? "Name" : `${formatEclipseEth(lamports)} ETH`,
      account: account.pubkey.toBase58(),
    });
  }
  return checked(
    "alldomains",
    "AllDomains",
    `${countPhrase(accounts.length, "name")}, ${formatEclipseEth(rent)} ETH`,
    findings,
    true,
    {
      href: "https://eclipse.alldomains.id",
      hrefLabel: "Open AllDomains",
    },
  );
}

async function scanSave(
  connection: Connection,
  owner: PublicKey,
): Promise<ProtocolReport> {
  const accounts = await connection.getProgramAccounts(new PublicKey(SAVE_PROGRAM_ID), {
    commitment: "confirmed",
    dataSlice: { offset: SAVE_COUNTS_OFFSET, length: 2 },
    filters: [
      { dataSize: SAVE_ACCOUNT_SIZE },
      { memcmp: { offset: SAVE_OWNER_OFFSET, bytes: owner.toBase58() } },
    ],
  });
  if (accounts.length === 0) {
    return checked("save", "Save", "Nothing open", [], false);
  }

  let rent = 0;
  let active = 0;
  let empty = 0;
  const findings: ProtocolFinding[] = [];
  for (let index = 0; index < accounts.length; index += 1) {
    const account = accounts[index];
    const lamports = safeLamports(account.account.lamports);
    if (lamports !== null) rent += lamports;
    const deposits = account.account.data[0] ?? 0;
    const borrows = account.account.data[1] ?? 0;
    if (deposits > 0 || borrows > 0) active += 1;
    else empty += 1;
    const detail = [
      deposits > 0 ? countPhrase(deposits, "deposit") : "",
      borrows > 0 ? countPhrase(borrows, "borrow") : "",
      deposits === 0 && borrows === 0 ? "Empty" : "",
      lamports !== null ? `${formatEclipseEth(lamports)} ETH` : "",
    ]
      .filter(Boolean)
      .join(", ");
    findings.push({
      label: account.pubkey.toBase58(),
      detail,
      account: account.pubkey.toBase58(),
    });
  }
  const parts = [
    active > 0 ? countPhrase(active, "obligation") : "",
    empty > 0 ? countPhrase(empty, "empty obligation") : "",
    `${formatEclipseEth(rent)} ETH`,
  ].filter(Boolean);
  return checked("save", "Save", parts.join(", "), findings, true, {
    href: "https://eclipse.save.finance",
    hrefLabel: "Open Save",
  });
}

export async function inspectProtocols(
  connection: Connection,
  owner: PublicKey,
  emit: (report: ProtocolReport) => void,
): Promise<{ empties: EmptyAccount[]; tokenAccounts: number; protocols: ProtocolReport[] }> {
  const reports = new Map<string, ProtocolReport>();
  const publish = (report: ProtocolReport) => {
    reports.set(report.id, report);
    emit(report);
  };

  const programs = [
    { id: "spl-token", name: "SPL Token", programId: TOKEN_PROGRAM_ID },
    { id: "token-2022", name: "Token-2022", programId: TOKEN_2022_PROGRAM_ID },
  ];
  const tokenWork = Promise.all(
    programs.map(async (program) => {
      try {
        const rows = await withTimeout(
          tokenRows(connection, owner, program.programId),
          program.name,
        );
        const result = tokenReport(program.id, program.name, owner.toBase58(), rows);
        publish(result.report);
        return { ok: true, empties: result.empties, rows };
      } catch (error) {
        publish(unavailable(program.id, program.name, error));
        return { ok: false, empties: [] as EmptyAccount[], rows: [] as TokenRow[] };
      }
    }),
  );

  const positionWork = [
    { id: "invariant", name: "Invariant", run: () => scanInvariant(connection, owner) },
    { id: "save", name: "Save", run: () => scanSave(connection, owner) },
    { id: "alldomains", name: "AllDomains", run: () => scanAllDomains(connection, owner) },
  ].map(async (protocol) => {
    try {
      publish(await withTimeout(protocol.run(), protocol.name));
    } catch (error) {
      publish(unavailable(protocol.id, protocol.name, error));
    }
  });

  const listed = await tokenWork;
  const ownedRows: TokenRow[] = [];
  const empties: EmptyAccount[] = [];
  for (let index = 0; index < listed.length; index += 1) {
    const entry = listed[index];
    for (let row = 0; row < entry.rows.length; row += 1) ownedRows.push(entry.rows[row]);
    for (let row = 0; row < entry.empties.length; row += 1) empties.push(entry.empties[row]);
  }

  if (listed.every((entry) => !entry.ok)) {
    publish(unavailable("orca", "Orca", new Error("Token accounts did not respond.")));
    publish(unavailable("solar", "Solar", new Error("Token accounts did not respond.")));
  } else {
    const nftChecks = [
      { id: "orca", name: "Orca", run: () => scanOrca(connection, ownedRows) },
      { id: "solar", name: "Solar", run: () => scanSolar(connection, ownedRows) },
    ].map(async (protocol) => {
      try {
        publish(await withTimeout(protocol.run(), protocol.name));
      } catch (error) {
        publish(unavailable(protocol.id, protocol.name, error));
      }
    });
    await Promise.all(nftChecks);
  }
  await Promise.all(positionWork);
  const protocols = PROTOCOL_CATALOG.map(
    (item) => reports.get(item.id) ?? unavailable(item.id, item.name, new Error("missing")),
  );
  return {
    empties,
    tokenAccounts: ownedRows.length,
    protocols,
  };
}
