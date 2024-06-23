<script lang="ts">
	import Footer from './footer.svelte'
	import Header from './header.svelte'
	import PageTransition from './transition.svelte'

	import 'open-props/style'
	import 'open-props/normalize'
	import 'open-props/buttons'
	import '../app.css'

	export let data
	// export const prerender = true;
</script>

<div class="layout">
	<Header />

	<main>
		<PageTransition url={data.url}>
			<slot />
		</PageTransition>
	</main>

	<Footer />
</div>

<style>
	.layout {
		height: 100%;
		width: inherit;
		/* max-inline-size: 1440px; */
		display: grid;
		grid-template-rows: auto 1fr auto;
		/* margin-inline: auto; */
		/* padding-inline: var(--size-7); */
		padding: 0 2em;
		/* padding-right: 2em; */
	}

	main {
		padding-block: var(--size-9);
	}

	Footer {
		padding-block: var(--size-7);
		border-top: 1px solid var(--border);
	}
</style>
