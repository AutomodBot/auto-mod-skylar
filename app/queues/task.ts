import { v4 } from 'uuid';
import type { Submission, Comment } from 'snoowrap';

const isComment = (item: Comment | Submission): item is Comment => !Object.keys(item).includes('comments');

export class Task {
	public id: string;
	public status: 'idle' | 'running' | 'failed';
	public error?: any;
	public type: 'comment' | 'submission';
	public item: Comment | Submission;

	constructor(item: Comment | Submission) {
		this.id = v4();
		this.status = 'idle';
		this.type = isComment(item) ? 'comment' : 'submission';
		this.item = item;
	}
}
