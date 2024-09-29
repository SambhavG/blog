import type { Post } from '$lib/types'
import * as config from '$lib/config'

// export async function load({ fetch }) {
// 	const response = await fetch('/api/posts')
// 	const posts: Post[] = await response.json()
// 	return { posts }
// }

import type { PageLoad } from './$types';
// import type { Post } from '$lib/types';

export const load: PageLoad = async () => {
	let posts: Post[] = [];

	try {
		const paths = import.meta.glob('/src/posts/*.md', { eager: true });

		for (const path in paths) {
			const file = paths[path];
			const slug = path.split('/').at(-1)?.replace('.md', '');

			if (file && typeof file === 'object' && 'metadata' in file && slug) {
				const metadata = file.metadata as Omit<Post, 'slug'>;
				const post = { ...metadata, slug } satisfies Post;
				post.published && posts.push(post);
			}
		}

		posts = posts.sort(
			(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
		);
	} catch (error) {
		console.error('Error loading posts:', error);
		return {
			status: 500,
			error: new Error('Failed to load posts')
		};
	}

	return {
		status: 200,
		body: { posts }
	};
};