"use client";

import {
  composeEclipsescanUrl,
  useNetwork,
} from "@/app/contexts/NetworkContext";
import { useWallets } from "@/app/hooks/useWallets";
import {
  EclipseSigner,
  EmptyAccount,
  explainReclaimError,
  formatEclipseEth,
  reclaimRent,
  ReclaimScan,
  scanWallet,
} from "@/lib/reclaim";
import { truncateWalletAddress } from "@/lib/stringUtils";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnector } from "@dynamic-labs/solana";
import { Connection } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";

const PREVIEW_ROWS = 6;

export const ReclaimContent = () => {
  const { solWallet } = useWallets();
  const { eclipseRpc, selectedOption } = useNetwork();
  const [scan, setScan] = useState<ReclaimScan | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signatures, setSignatures] = useState<string[]>([]);
  const request = useRef(0);
  const address = solWallet?.address;

  const check = useCallback(async (keepError = false) => {
    const id = ++request.current;
    if (!address) {
      setScan(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    if (!keepError) setError("");
    try {
      const connection = new Connection(eclipseRpc, "confirmed");
      const next = await scanWallet(connection, address);
      if (id !== request.current) return;
      setScan(next);
    } catch (cause) {
      if (id !== request.current) return;
      setError(explainReclaimError(cause));
    } finally {
      if (id === request.current) setChecking(false);
    }
  }, [address, eclipseRpc]);

  useEffect(() => {
    setSignatures([]);
    void check();
  }, [check]);

  const rent =
    scan?.empties.reduce((sum, account) => sum + account.lamports, 0) ?? 0;
  const needsFee = Boolean(
    scan && scan.empties.length > 0 && scan.lamports < scan.networkFee,
  );
  const canReclaim = Boolean(
    scan && scan.empties.length > 0 && !needsFee && !checking && !submitting,
  );
  const canRetry = Boolean(!scan && error && !checking && !submitting);

  const reclaim = async () => {
    if (!scan || !solWallet || !canReclaim) return;
    setSubmitting(true);
    setError("");
    setSignatures([]);
    try {
      const signer = await (
        solWallet.connector as SolanaWalletConnector
      ).getSigner();
      if (!signer?.signTransaction) {
        throw new Error("This wallet cannot sign an Eclipse transaction.");
      }
      const connection = new Connection(eclipseRpc, "confirmed");
      const sent = await reclaimRent({
        connection,
        ownerAddress: scan.owner,
        accounts: scan.empties,
        signer: signer as EclipseSigner,
        onSignature: (signature) =>
          setSignatures((current) => [...current, signature]),
      });
      setSignatures(sent);
      setError("");
    } catch (cause) {
      setError(explainReclaimError(cause));
    } finally {
      setSubmitting(false);
      await check(true);
    }
  };

  if (!address) {
    return (
      <div className="reclaim">
        <p className="reclaim-lead">
          Connect an Eclipse wallet to find empty token accounts and reclaim
          the rent.
        </p>
        <DynamicConnectButton
          buttonClassName="wallet-connect-button w-full"
          buttonContainerClassName="submit-button connect-btn"
        >
          <span style={{ width: "100%" }}>Connect Eclipse wallet</span>
        </DynamicConnectButton>
      </div>
    );
  }

  const preview = scan?.empties.slice(0, PREVIEW_ROWS) ?? [];
  const hidden = (scan?.empties.length ?? 0) - preview.length;
  const buttonText = submitting
    ? "Confirm in your wallet"
    : checking && !scan
      ? "Checking wallet"
      : canRetry
        ? "Check again"
        : needsFee
          ? "Need ETH for the network fee"
          : scan && scan.empties.length === 0
            ? "Nothing to reclaim"
            : "Reclaim";

  return (
    <div className="reclaim">
      <p className="reclaim-lead">
        Close empty token accounts and return the rent to this wallet. Token
        balances stay where they are.
      </p>
      {scan && (
        <>
          <dl className="reclaim-summary">
            <dt>Wallet</dt>
            <dd>
              <a
                className="reclaim-link"
                href={composeEclipsescanUrl(
                  selectedOption,
                  `/account/${scan.owner}`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                {truncateWalletAddress(scan.owner)}
              </a>
            </dd>
            <dt>ETH</dt>
            <dd>{formatEclipseEth(scan.lamports)}</dd>
            <dt>Token accounts</dt>
            <dd>{scan.tokenAccounts}</dd>
            <dt>Empty accounts</dt>
            <dd>{scan.empties.length}</dd>
            <dt>Rent</dt>
            <dd>{formatEclipseEth(rent)} ETH</dd>
            <dt>Network fee</dt>
            <dd>{formatEclipseEth(scan.networkFee)} ETH</dd>
          </dl>
          {preview.length > 0 && (
            <ul className="reclaim-accounts">
              {preview.map((account) => (
                <AccountRow key={account.address} account={account} />
              ))}
              {hidden > 0 && <li>and {hidden} more</li>}
            </ul>
          )}
          {needsFee && (
            <p className="reclaim-note">
              This wallet needs at least {formatEclipseEth(scan.networkFee)} ETH
              to pay the network fee. The rent is returned in the same
              transaction.
            </p>
          )}
        </>
      )}
      {checking && <p className="reclaim-note">Checking wallet…</p>}
      {error && <p className="reclaim-status">{error}</p>}
      {signatures.length > 0 && (
        <p className="reclaim-status ok">
          Reclaimed.{" "}
          {signatures.map((signature) => (
            <a
              key={signature}
              className="reclaim-link"
              href={composeEclipsescanUrl(selectedOption, `/tx/${signature}`)}
              target="_blank"
              rel="noreferrer"
            >
              {truncateWalletAddress(signature)}{" "}
            </a>
          ))}
        </p>
      )}
      <button
        className={`w-full deposit-button p-4 submit-button ${canReclaim || canRetry ? "" : "disabled"}`}
        disabled={!canReclaim && !canRetry}
        onClick={canRetry ? () => void check() : reclaim}
      >
        {buttonText}
      </button>
    </div>
  );
};

const AccountRow = ({ account }: { account: EmptyAccount }) => (
  <li>
    <span>{truncateWalletAddress(account.mint)}</span>
    <span>{formatEclipseEth(account.lamports)} ETH</span>
  </li>
);
