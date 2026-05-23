export type MissionStatus = "Live" | "Draft" | "Closed";
export type SubmissionStatus = "Pending" | "Approved" | "Needs fix" | "Rejected";

export type Mission = {
  id: string;
  brand: string;
  title: string;
  brief: string;
  rewardPool: string;
  deadline: string;
  status: MissionStatus;
  minimumViews: string;
  requiredHashtag: string;
  requiredSound: string;
  requirements: string[];
};

export type Submission = {
  id: string;
  creator: string;
  handle: string;
  missionId: string;
  link: string;
  views: string;
  engagement: string;
  score: number;
  reward: string;
  status: SubmissionStatus;
  checks: {
    hashtag: boolean;
    sound: boolean;
    disclosure: boolean;
    deadline: boolean;
  };
};

export const missions: Mission[] = [
  {
    id: "kuda-split",
    brand: "Kuda",
    title: "Show your real split-bill routine",
    brief: "Post a short TikTok showing how you split expenses with friends after a meal, trip, or shared purchase.",
    rewardPool: "$2,000",
    deadline: "12 days left",
    status: "Live",
    minimumViews: "1,000",
    requiredHashtag: "#KudaSplit",
    requiredSound: "Kuda creator sound",
    requirements: ["Use #KudaSplit", "Use the approved sound", "Show app screen or receipt", "Add paid partnership disclosure"],
  },
  {
    id: "chowdeck-lunch",
    brand: "Chowdeck",
    title: "Fastest lunch delivery proof",
    brief: "Film a simple order-to-arrival story for a real lunch delivery in Lagos.",
    rewardPool: "$1,200",
    deadline: "6 days left",
    status: "Draft",
    minimumViews: "750",
    requiredHashtag: "#ChowdeckRun",
    requiredSound: "Any original audio",
    requirements: ["Use #ChowdeckRun", "Film order to arrival", "No scripted claims", "Lagos creators only"],
  },
  {
    id: "piggyvest-lock",
    brand: "PiggyVest",
    title: "Show what your locked savings protected",
    brief: "Tell a specific story about a purchase or goal that your savings discipline helped protect.",
    rewardPool: "$1,500",
    deadline: "19 days left",
    status: "Live",
    minimumViews: "1,500",
    requiredHashtag: "#PiggyProtectedIt",
    requiredSound: "Creator choice",
    requirements: ["Use #PiggyProtectedIt", "Mention a real goal", "No income guarantees", "Add paid partnership disclosure"],
  },
];

export const submissions: Submission[] = [
  {
    id: "sub-001",
    creator: "Tomi Ade",
    handle: "@tomitalks",
    missionId: "kuda-split",
    link: "https://www.tiktok.com/@tomitalks/video/7341000000000000001",
    views: "48.2k",
    engagement: "8.7%",
    score: 91,
    reward: "$240",
    status: "Approved",
    checks: { hashtag: true, sound: true, disclosure: true, deadline: true },
  },
  {
    id: "sub-002",
    creator: "Ife Banks",
    handle: "@ifebanks",
    missionId: "kuda-split",
    link: "https://www.tiktok.com/@ifebanks/video/7341000000000000002",
    views: "13.9k",
    engagement: "6.1%",
    score: 78,
    reward: "$120",
    status: "Pending",
    checks: { hashtag: true, sound: true, disclosure: false, deadline: true },
  },
  {
    id: "sub-003",
    creator: "Ada UGC",
    handle: "@adauugc",
    missionId: "chowdeck-lunch",
    link: "https://www.tiktok.com/@adauugc/video/7341000000000000003",
    views: "2.4k",
    engagement: "3.2%",
    score: 54,
    reward: "$0",
    status: "Needs fix",
    checks: { hashtag: true, sound: false, disclosure: false, deadline: true },
  },
];

export const scoreRules = [
  { label: "Instruction match", value: 30, detail: "Hashtag, sound, deadline, region, and required scene." },
  { label: "Reach quality", value: 25, detail: "Views, audience fit, and suspicious spike checks." },
  { label: "Engagement depth", value: 20, detail: "Comments, shares, saves, and engagement-to-view ratio." },
  { label: "Authenticity", value: 15, detail: "Natural creator voice without copy-paste ad language." },
  { label: "Brand safety", value: 10, detail: "Disclosure, claims, prohibited content, and tone risk." },
];

export const walletTransactions = [
  { id: "wallet-001", label: "Kuda approved reward", amount: "$240", status: "Available" },
  { id: "wallet-002", label: "PiggyVest pending review", amount: "$90", status: "Pending" },
  { id: "wallet-003", label: "Paystack payout", amount: "-$150", status: "Paid" },
];

export const stats = [
  { label: "Live missions", value: "2", detail: "1 draft campaign" },
  { label: "Submitted videos", value: "3", detail: "1 awaiting review" },
  { label: "Verified views", value: "64.5k", detail: "approved + pending" },
  { label: "Reward pool", value: "$4.7k", detail: "across Phase 1" },
];

export function getMission(id: string) {
  return missions.find((mission) => mission.id === id);
}

export function getMissionTitle(id: string) {
  return getMission(id)?.title ?? "Unknown mission";
}
