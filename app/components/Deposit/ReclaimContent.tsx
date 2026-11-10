"use client";

import {
  composeEclipsescanUrl,
  useNetwork,
} from "@/app/contexts/NetworkContext";
import { useWallets } from "@/app/hooks/useWallets";
import {
  EclipseSigner,
  explainReclaimError,
  formatEclipseEth,
  protocolPlaceholders,
  ProtocolReport,
  reclaimRent,
  scanWallet,
} from "@/lib/reclaim";
import { truncateWalletAddress } from "@/lib/stringUtils";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnector } from "@dynamic-labs/solana";
import { Connection } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";

export const ReclaimContent = () => {
  const { solWallet } = useWallets();
  const { eclipseRpc, selectedOption } = useNetwork();
  const [scan, setScan] = useState<Awaited<ReturnType<typeof scanWallet>> | null>(
    null,
  );
  const [protocols, setProtocols] = useState<ProtocolReport[]>(
    protocolPlaceholders("After you connect"),
  );
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
      setProtocols(protocolPlaceholders("After you connect"));
      setChecking(false);
      return;
    }
    setChecking(true);
    setProtocols(protocolPlaceholders("Checking"));
    if (!keepError) setError("");
    try {
      const connection = new Connection(eclipseRpc, "confirmed");
      const next = await scanWallet(connection, address, (report) => {
        if (id !== request.current) return;
        setProtocols((current) =>
          current.map((item) => (item.id === report.id ? report : item)),
        );
      });
      if (id !== request.current) return;
      setScan(next);
      setProtocols(next.protocols);
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
  const protocolFailed = protocols.some((item) => item.status === "unavailable");

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
      <div className="reclaim-scroll">
        <h1 className="reclaim-title">Reclaim</h1>
        <p className="reclaim-lead">
          {address
            ? "Close empty token accounts and return the rent to this wallet. Open positions stay in their protocols."
            : "Connect an Eclipse wallet. Reclaim checks these protocols, then closes empty token accounts."}
        </p>
        {!address && (
          <DynamicConnectButton
            buttonClassName="wallet-connect-button w-full"
            buttonContainerClassName="submit-button connect-btn"
          >
            <span style={{ width: "100%" }}>Connect Eclipse wallet</span>
          </DynamicConnectButton>
        )}
        {scan && (
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
            <dt>Closable rent</dt>
            <dd>{formatEclipseEth(rent)} ETH</dd>
            <dt>Network fee</dt>
            <dd>{formatEclipseEth(scan.networkFee)} ETH</dd>
          </dl>
        )}
        <ProtocolList
          protocols={protocols}
          accountUrl={(account) =>
            composeEclipsescanUrl(selectedOption, `/account/${account}`)
          }
        />
        {needsFee && scan && (
          <p className="reclaim-note">
            This wallet needs at least {formatEclipseEth(scan.networkFee)} ETH
            to pay the network fee. The rent comes back in the same transaction.
          </p>
        )}
        {protocols.some((item) => item.attention) && (
          <p className="reclaim-note">
            Reclaim closes empty token accounts. Positions, loans, and names
            stay in their protocols.
          </p>
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
        {address && protocolFailed && !checking && (
          <button className="reclaim-retry" onClick={() => void check()}>
            Check again
          </button>
        )}
      </div>
      {address && (
        <button
          className={`w-full deposit-button p-4 submit-button ${canReclaim || canRetry ? "" : "disabled"}`}
          disabled={!canReclaim && !canRetry}
          onClick={canRetry ? () => void check() : reclaim}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

const ProtocolList = ({
  protocols,
  accountUrl,
}: {
  protocols: ProtocolReport[];
  accountUrl: (account: string) => string;
}) => (
  <section className="reclaim-protocols" aria-label="Protocols">
    <h2 className="reclaim-kicker">Protocols</h2>
    <ul>
      {protocols.map((protocol) => (
        <li key={protocol.id} className="reclaim-protocol">
          <span
            className={`reclaim-dot ${protocol.status}${protocol.attention ? " attention" : ""}`}
          />
          <span className="reclaim-protocol-name">{protocol.name}</span>
          <span
            className={`reclaim-protocol-summary${protocol.attention ? " attention" : ""}`}
          >
            {protocol.summary}
            {protocol.href && protocol.hrefLabel && (
              <>
                {" "}
                <a
                  className="reclaim-link"
                  href={protocol.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {protocol.hrefLabel}
                </a>
              </>
            )}
          </span>
          {protocol.findings.length > 0 && (
            <ul className="reclaim-findings">
              {protocol.findings.map((finding) => (
                <li key={`${finding.account ?? finding.label}-${finding.detail}`}>
                  {finding.account ? (
                    <a
                      className="reclaim-link"
                      href={accountUrl(finding.account)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {finding.label.length > 20
                        ? truncateWalletAddress(finding.label)
                        : finding.label}
                    </a>
                  ) : (
                    <span>
                      {finding.label.length > 20
                        ? truncateWalletAddress(finding.label)
                        : finding.label}
                    </span>
                  )}
                  <span>{finding.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </section>
);
