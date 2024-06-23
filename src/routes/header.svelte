<script lang="ts">
	import Toggle from './toggle.svelte'
	import * as config from '$lib/config'
</script>

<nav>
	<a href="/" class="title">
		<b>{config.title}</b>
	</a>
	<Toggle />
</nav>

<style>
	nav {
		padding-block: var(--size-7);
		/* padding-right: 2em; */
		display: flex;
		justify-content: space-between;
	}

	.links {
		margin-block: var(--size-7);
	}

	a {
		color: inherit;
		text-decoration: none;
		padding-top: var(--size-1);
	}
	b {
		font-size: 1.4em;
	}

	@media (min-width: 768px) {
		nav {
			display: flex;
			justify-content: space-between;
		}

		.links {
			display: flex;
			gap: var(--size-7);
			margin-block: 0;
		}
	}
</style>
