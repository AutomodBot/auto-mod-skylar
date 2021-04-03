export const subreddit = (process.env.SUBREDDIT ?? 'this-does-not-exist-at-all-because-it-is-too-long-for-reddit-change-this-please').replace(/(\/?r\/)([a-z]*)/, '$2');
