"use client";

import { useMemo, useState } from "react";
import { submitTikTokVideo } from "@/app/actions";
import type { Mission } from "@/lib/data";

type Props = {
  creatorHandle: string;
  missions: Mission[];
};

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

export function MultiLinkSubmissionForm({ creatorHandle, missions }: Props) {
  const [links, setLinks] = useState([""]);
  const normalizedLinks = useMemo(() => links.map(normalizeUrl).filter(Boolean), [links]);
  const duplicates = normalizedLinks.filter((link, index) => normalizedLinks.indexOf(link) !== index);
  const invalidLinks = normalizedLinks.filter((link) => !isTikTokUrl(link));
  const canSubmit = normalizedLinks.length > 0 && duplicates.length === 0 && invalidLinks.length === 0;

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

          return (
            <label key={index}>
              Entry {index + 1}
              <input
                name="tiktokUrl"
                onChange={(event) => {
                  const nextLinks = [...links];
                  nextLinks[index] = event.target.value;
                  setLinks(nextLinks);
                }}
                placeholder="https://www.tiktok.com/@creator/video/..."
                required={index === 0}
                type="url"
                value={link}
              />
              {isInvalid ? <small>Enter a valid TikTok URL.</small> : null}
              {isDuplicate ? <small>This link is already added.</small> : null}
            </label>
          );
        })}
      </div>

      <div className="hero-actions">
        <button
          className="ghost-button"
          onClick={() => setLinks([...links, ""])}
          type="button"
        >
          Add another link
        </button>
        {links.length > 1 ? (
          <button
            className="ghost-button"
            onClick={() => setLinks(links.slice(0, -1))}
            type="button"
          >
            Remove last
          </button>
        ) : null}
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
