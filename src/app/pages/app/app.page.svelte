<script>
	// Imports
	import { formatDate } from "../../helpers/"
	import { Module, Webnav, Aside } from "../../components/";
	import { getContext, onMount } from "svelte";

	import DatatablePartial from './datatable.partial.svelte'

	// Exports

	// State
	const { client, session} = getContext("services")
	// let firstname = session.getSession().user.name.split(' ')[0] || '🌄'
	let records = []
	
	// Fetch 
	onMount(async ()=>{
		records = await client.app.findMany()
		records = [...records]
	})

</script>

<style>
section[slot="header"]{
	font-size: 2em;
	font-weight:600;
}

section[slot="webnav"]{
	width:100%;
}
</style>

<Module>

	<section slot="webnav">
		<Webnav></Webnav>
	</section>

	<section slot="mobnav">
		<img src="img/logo.png" alt="app logo">
	</section>

	<section slot="aside">
		<Aside></Aside>
	</section>
	
	<section slot="header">
		App
	</section>

	<section slot="main" >
		<svelte:component this={DatatablePartial} bind:data={records}></svelte:component>
  	</section>

</Module>


