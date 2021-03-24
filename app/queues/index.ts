import { EventEmitter } from 'tsee';
import type { Submission, Comment } from 'snoowrap';
import { shouldWeIgnoreThisTask, sleepForNSeconds } from '../utils';
import { log as logger } from '../log';
import { removeSpamSubmission, removeSubmissionAskingForUpvotes, removeUnverifiedSellerSubmissions } from '../submissions';
import { logComment, removeSpamComment } from '../comments';
import { Task } from './task';

const isSubmission = (item: Comment | Submission): item is Submission => Object.keys(item).includes('comments');
const isComment = (item: Comment | Submission): item is Comment => !Object.keys(item).includes('comments');

type Options = {
	minimumRunSpacing: number;
	concurrency: number;
};

class Queue extends EventEmitter<{
	add: (task: Task) => void;
	delete: (task: Task) => void;
	clear: () => void;
}> {
	private readonly tasks: Set<Task>;
	private readonly minimumRunSpacing: number;
	private readonly runningTasks: Set<Task> = new Set();
	private readonly concurrency: number;
	private readonly logger = logger;
	private lastRun: number;
	private paused = true;

	constructor(tasks: Task[] = [], options?: Options) {
		super();

		this.tasks = new Set<Task>(tasks);
		this.minimumRunSpacing = options?.minimumRunSpacing ?? 1000;
		this.concurrency = options?.concurrency ?? 1;
		this.lastRun = new Date().getTime() - this.minimumRunSpacing;
		this.runningTasks = new Set<Task>();
	}

	async start() {
		this.logger.silly('Started processing queue');
		this.paused = false;
		await this.run();

		// If the run step ends then wait for a
		// new task to be added before starting again
		this.once('add', this.start.bind(this));
	}

	async stop() {
		// Remove old event handler
		this.off('add', this.start);

		// Ensure we stop after the current task
		this.paused = true;
	}

	async run() {
		this.logger.silly('Starting "run" cycle...');

		// If we're paused then stop the loop
		if (this.paused) {
			this.logger.silly('Paused queue, waiting for new task to be added.');
			return;
		}

		// Get a task to process
		const task = await this.getTask();

		// If no task then we're done processing for now
		if (!task) {
			return;
		}

		try {
			// Set the current time as the lastRun
			this.lastRun = new Date().getTime();

			// Add task to "running tasks" queue
			this.runningTasks.add(task);

			// Process task
			await this.processTask(task);

			// Delete successful task from queues
			this.runningTasks.delete(task);
			this.tasks.delete(task);
		} catch (error: unknown) {
			task.error = error;
			task.status = 'failed';
		} finally {
			this.logger.silly('Finished "run" cycle!');
		}

		// Do it all again!
		return this.run();
	}

	getMsToWait() {
		// Too many tasks are already running
		if (this.runningTasks.size >= this.concurrency) {
			this.logger.debug('Too many tasks running (%s/%s)', this.runningTasks.size, this.concurrency);
			return this.minimumRunSpacing;
		}

		// It hasn't been long enough of a wait
		const now = new Date().getTime();
		const nextTimeToRun = this.lastRun + this.minimumRunSpacing;
		const timeLeft = nextTimeToRun - now;
		if (timeLeft >= 1) {
			this.logger.silly('Waiting %ss before running next task.', timeLeft / 1000);
			return timeLeft;
		}

		this.logger.silly('We can run the next task now');
		return 0;
	}

	async getTask(): Promise<Task | undefined> {
		this.logger.silly('Trying to get a task...');
		const msToWait = this.getMsToWait();
		if (msToWait >= 1) {
			await sleepForNSeconds(msToWait / 1000);
			return this.getTask();
		}

		// If the queue is empty then wait 10s
		const task = this.tasks.values().next();
		if (task.done) {
			this.logger.silly('Queue done!');
			return;
		}

		this.logger.silly('Got %s task [%s]', task.value.type, task.value.id);
		return task.value;
	}

	async processTask(task: Task) {
		// Should we ignore this task?
		if (await shouldWeIgnoreThisTask(task)) {
			return;
		}

		this.logger.debug('Processing %s %s by %s', task.type, task.item.id, task.item.author.name);

		// Comment
		if (isComment(task.item)) {
			await logComment(task.item);
			await removeSpamComment(task.item);

			// T
			// 	await removeAbuseComment(comment);
		}

		// Submission
		if (isSubmission(task.item)) {
			await removeSpamSubmission(task.item);
			await removeSubmissionAskingForUpvotes(task.item);
			await removeUnverifiedSellerSubmissions(task.item);
		}
	}

	add(task: Task) {
		this.tasks.add(task);
		this.emit('add', task);
	}

	has(task: Task) {
		this.tasks.has(task);
	}

	delete(task: Task) {
		this.tasks.delete(task);
		this.emit('delete', task);
	}

	clear() {
		this.tasks.clear();
		this.emit('clear');
	}

	entries() {
		return this.tasks.entries();
	}

	keys() {
		return this.tasks.keys();
	}

	values() {
		return this.tasks.values();
	}

	get size() {
		return this.tasks.size;
	}
}

export const queue = new Queue();
