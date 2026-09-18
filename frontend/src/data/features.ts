import ChatBubbleIcon from "@/assets/chat-bubble.svg?react";
import FolderIcon from "@/assets/folder.svg?react";
import LightningIcon from "@/assets/lightning.svg?react";
import LockIcon from "@/assets/lock.svg?react";
import VideoCameraIcon from "@/assets/video-camera.svg?react";
import WebIcon from "@/assets/web.svg?react";
import type { Feature } from "@/types";

export const FEATURES: Feature[] = [
	{
		id: "messaging",
		title: "Real-time Messaging",
		text: "Send messages, see typing indicators and read receipts, with sync across every device your team uses.",
		Icon: ChatBubbleIcon,
		iconSize: 48,
	},
	{
		id: "file sharing",
		title: "File Sharing",
		text: "Drag a file into any channel to share it. Preview images and documents without leaving the app.",
		Icon: FolderIcon,
		iconSize: 40,
	},
	{
		id: "video calls",
		title: "Video Calls",
		text: "Start a call from any message thread with screen sharing and recording for up to 100 participants.",
		Icon: VideoCameraIcon,
		iconSize: 48,
	},
	{
		id: "security",
		title: "Enterprise Security",
		text: "End-to-end encryption, SSO logins, and audit logs that satisfy your security review process.",
		Icon: LockIcon,
		iconSize: 38,
	},
	{
		id: "cross platform",
		title: "Cross-platform",
		text: "Desktop apps for Mac, Windows and Linux. A mobile app for iOS and Android that works offline.",
		Icon: WebIcon,
		iconSize: 40,
	},
	{
		id: "integrations",
		title: "Integrations",
		text: "Connect the tools you already use — Jira, GitHub, Figma — so updates land where your team can act on them.",
		Icon: LightningIcon,
		iconSize: 38,
	},
];
