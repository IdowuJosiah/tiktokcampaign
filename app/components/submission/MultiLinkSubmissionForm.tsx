"use client";

import { useMemo, useRef, useState } from "react";
import { submitTikTokVideo } from "@/app/actions";
import type { Mission } from "@/lib/data";

type Props = {
  creatorHandle: string;
  missions: Mission[];
};

type LinkStatus =
  | { state: "loading" }
  | { state: "ok" }
  | { state: "error"; message: string }
  | null;

function normalizeUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function isTikTokUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "tiktok.com" || url.hostname.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

function reasonMessage(reason: string | undefined) {
  switch (reason) {
    case "ownership":
      return "This video isn't on your connected TikTok account.";
    case "not_found":
      return "We couldn't find this video. Make sure it's public and the link is correct.";
    case "tiktok_required":
    case "creator_required":
      return "Verify your TikTok account before adding links.";
    case "invalid":
      return "Enter a valid TikTok URL.";
    default:
      return "Couldn't verify this link right now. Try again.";
  }
}

const MINIMUM_LINKS = 3;

export function MultiLinkSubmissionForm({ creatorHandle, missions }: Props) {
  const [links, setLinks] = useState<string[]>(Array(MINIMUM_LINKS).fill(""));
  const [statuses, setStatuses] = useState<LinkStatus[]>(Array(MINIMUM_LINKS).fill(null));
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const seqs = useRef<Record<number, number>>({});

  const normalizedLinks = useMemo(() => links.map(normalizeUrl).filter(Boolean), [links]);
  const duplicates = normalizedLinks.filter((link, index) => normalizedLinks.indexOf(link) !== index);
  const invalidLinks = normalizedLinks.filter((link) => !isTikTokUrl(link));

  const allVerified = links.every((link, index) => {
    if (!normalizeUrl(link)) return true; // empty entries don't block; the minimum check covers count
    return statuses[index]?.state === "ok";
  });
  const canSubmit =
    normalizedLinks.length >= MINIMUM_LINKS &&
    duplicates.length === 0 &&
    invalidLinks.length === 0 &&
    allVerified;

  function setStatusAt(index: number, status: LinkStatus) {
    setStatuses((prev) => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  }

  function scheduleCheck(index: number, rawValue: string) {
    clearTimeout(timers.current[index]);
    const normalized = normalizeUrl(rawValue);

    // Nothing to verify yet, or the format is wrong (a separate inline message
    // already covers that) — clear any prior status and don't hit the API.
    if (!normalized || !isTikTokUrl(normalized)) {
      setStatusAt(index, null);
      return;
    }

    setStatusAt(index, { state: "loading" });
    const mySeq = (seqs.current[index] ?? 0) + 1;
    seqs.current[index] = mySeq;

    timers.current[index] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tiktok/verify-link?url=${encodeURIComponent(normalized)}`);
        const data = await res.json();
        if (seqs.current[index] !== mySeq) return; // a newer edit superseded this check
        setStatusAt(index, data.ok ? { state: "ok" } : { state: "error", message: reasonMessage(data.reason) });
      } catch {
        if (seqs.current[index] !== mySeq) return;
        setStatusAt(index, { state: "error", message: reasonMessage(undefined) });
      }
    }, 600);
  }

  function updateLink(index: number, value: string) {
    setLinks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    scheduleCheck(index, value);
  }

  return (
    <form action={submitTikTokVideo} className="submission-form">
      <label>
        Campaign
        <select name="missionId" defaultValue={missions[0]?.id}>
          {missions.map((mission) => (
            <option value={mission.id} key={mission.id}>{mission.brand} · {mission.title}</option>
          ))}
        </select>
      </label>

      <input name="creatorHandle" type="hidden" value={creatorHandle} />

      <div className="link-list">
        <span>TikTok video links</span>
        {links.map((link, index) => {
          const normalized = normalizeUrl(link);
          const isDuplicate = normalized && duplicates.includes(normalized);
          const isInvalid = normalized && !isTikTokUrl(normalized);
          const status = statuses[index];

          return (
            <label key={index}>
              Entry {index + 1}
              <input
                name="tiktokUrl"
                onChange={(event) => updateLink(index, event.target.value)}
                placeholder="https://www.tiktok.com/@creator/video/..."
                required={index === 0}
                type="url"
                value={link}
              />
              {isInvalid ? <small>Enter a valid TikTok URL.</small> : null}
              {!isInvalid && isDuplicate ? <small>This link is already added.</small> : null}
              {!isInvalid && !isDuplicate && status?.state === "loading" ? (
                <small style={{ color: "var(--muted)" }}>Checking this link…</small>
              ) : null}
              {!isInvalid && !isDuplicate && status?.state === "ok" ? (
                <small style={{ color: "var(--accent)" }}>✓ Verified — this is your video</small>
              ) : null}
              {!isInvalid && !isDuplicate && status?.state === "error" ? (
                <small style={{ color: "#ff6b6b" }}>{status.message}</small>
              ) : null}
            </label>
          );
        })}
      </div>

      <div className="checklist">
        <label><input name="hashtagOk" type="checkbox" /> I used the required hashtag</label>
        <label><input name="soundOk" type="checkbox" /> I used the required sound, if listed</label>
        <label><input name="disclosureOk" type="checkbox" /> I added paid partnership disclosure</label>
        <label><input name="publicVideoOk" type="checkbox" /> The videos are public</label>
      </div>

      <button className="primary-button full" disabled={!canSubmit} type="submit">
        Submit {normalizedLinks.length || ""} {normalizedLinks.length === 1 ? "entry" : "entries"}
      </button>
    </form>
  );
}
