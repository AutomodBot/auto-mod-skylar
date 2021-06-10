
export interface MediaEmbed {}

export interface SecureMediaEmbed {}

export interface Gildings {}

export interface Source {
	url: string;
	width: number;
	height: number;
}

export interface Resolution {
	url: string;
	width: number;
	height: number;
}

export interface Source2 {
	url: string;
	width: number;
	height: number;
}

export interface Resolution2 {
	url: string;
	width: number;
	height: number;
}

export interface Obfuscated {
	source: Source2;
	resolutions: Resolution2[];
}

export interface Source3 {
	url: string;
	width: number;
	height: number;
}

export interface Resolution3 {
	url: string;
	width: number;
	height: number;
}

export interface Nsfw {
	source: Source3;
	resolutions: Resolution3[];
}

export interface Variants {
	obfuscated: Obfuscated;
	nsfw: Nsfw;
}

export interface Image {
	source: Source;
	resolutions: Resolution[];
	variants: Variants;
	id: string;
}

export interface Preview {
	images: Image[];
	enabled: boolean;
}

export interface Submission {
	author_flair_background_color?: any;
	approved_at_utc?: any;
	subreddit: string;
	selftext: string;
	author_fullname: string;
	saved: boolean;
	mod_reason_title?: any;
	gilded: number;
	clicked: boolean;
	title: string;
	link_flair_richtext: any[];
	subreddit_name_prefixed: string;
	hidden: boolean;
	pwls: number;
	link_flair_css_class: string;
	downs: number;
	thumbnail_height: number;
	top_awarded_type?: any;
	hide_score: boolean;
	name: string;
	quarantine: boolean;
	link_flair_text_color: string;
	upvote_ratio: number;
	ignore_reports: boolean;
	ups: number;
	domain: string;
	media_embed: MediaEmbed;
	thumbnail_width: number;
	author_flair_template_id?: any;
	is_original_content: boolean;
	user_reports: any[];
	secure_media?: any;
	is_reddit_media_domain: boolean;
	is_meta: boolean;
	category?: any;
	secure_media_embed: SecureMediaEmbed;
	link_flair_text: string;
	can_mod_post: boolean;
	score: number;
	approved_by?: any;
	is_created_from_ads_ui: boolean;
	author_premium: boolean;
	thumbnail: string;
	edited: boolean;
	author_flair_css_class?: any;
	author_flair_richtext: any[];
	gildings: Gildings;
	post_hint: string;
	content_categories?: any;
	is_self: boolean;
	subreddit_type: string;
	created: number;
	link_flair_type: string;
	wls: number;
	removed_by_category?: any;
	banned_by?: any;
	author_flair_type: string;
	total_awards_received: number;
	allow_live_comments: boolean;
	selftext_html?: any;
	likes?: any;
	suggested_sort?: any;
	banned_at_utc?: any;
	url_overridden_by_dest: string;
	view_count?: any;
	archived: boolean;
	no_follow: boolean;
	spam: boolean;
	is_crosspostable: boolean;
	pinned: boolean;
	over_18: boolean;
	preview: Preview;
	all_awardings: any[];
	awarders: any[];
	media_only: boolean;
	link_flair_template_id: string;
	can_gild: boolean;
	removed: boolean;
	spoiler: boolean;
	locked: boolean;
	author_flair_text?: any;
	treatment_tags: any[];
	visited: boolean;
	removed_by?: any;
	mod_note?: any;
	distinguished?: any;
	subreddit_id: string;
	mod_reason_by?: any;
	num_reports: number;
	removal_reason?: any;
	link_flair_background_color: string;
	id: string;
	is_robot_indexable: boolean;
	report_reasons: any[];
	author: string;
	discussion_type?: any;
	num_comments: number;
	send_replies: boolean;
	whitelist_status: string;
	contest_mode: boolean;
	mod_reports: any[];
	author_patreon_flair: boolean;
	approved: boolean;
	author_flair_text_color?: any;
	permalink: string;
	parent_whitelist_status: string;
	stickied: boolean;
	url: string;
	subreddit_subscribers: number;
	created_utc: number;
	num_crossposts: number;
	media?: any;
	is_video: boolean;
	comments: any[];
}
