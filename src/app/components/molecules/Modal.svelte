<script>
	import { onMount, onDestroy } from 'svelte'
	import { fade, fly } from 'svelte/transition';
	
	export let aside = false;
	export let section = false;
	export let main = false;
	export let div = true;
	
	export let backgroundColor = "rgba(0,0,0,0.4)";
	export let foregroundColor = "#FFF";
	export let index = 0;
	export let style = "";
	export let visible = false;
	
	const defaultTransition = {  duration: 250 };
	export let transition = {};
	
	let modalContainer;
	const modalContainerStyle = `
		--index:${index};
		--modalBackgroundColor:${backgroundColor};
		--modalForegroundColor:${foregroundColor};
		`
	
	const keyUpHandler = (event)=> {
			if(event.key === 'Escape' || event.keyCode === 27){
				visible = false;
			}
	}
	
	onMount(()=>{
		document.addEventListener("keyup", keyUpHandler)
	})
	
	onDestroy(()=>{
		document.removeEventListener
	})
</script>

{#if visible}
<div transition:fade={{ duration: transition.duration || defaultTransition.duration }} class="modal-container" style={modalContainerStyle}  bind:this={modalContainer} on:click={()=>{ visible = false } } >
{#if aside}
	<aside transition:fly={ { ...defaultTransition, ...transition } } class="modal-content" on:click|stopPropagation={()=>{}} {style}  >
		<slot></slot>
	</aside>
{:else if section}
	<section transition:fly={ { ...defaultTransition, ...transition } } class="modal-content" on:click|stopPropagation={()=>{}} {style} >
		<slot></slot>
	</section>
{:else if main}
	<main transition:fly={ { ...defaultTransition, ...transition } } class="modal-content" on:click|stopPropagation={()=>{}} {style} >
		<slot></slot>
	</main>
{:else if div}
	<div transition:fly={ { ...defaultTransition, ...transition } } class="modal-content" on:click|stopPropagation={()=>{}} {style} >
		<slot></slot>
	</div>
{/if}
</div>
{/if}

<style>
	.modal-container{
		position:fixed;
		top:0px;
		bottom:0px;
		left:0px;
		right:0px;
		z-index:var(--index);
		background:var(--modalBackgroundColor);
		display:flex;
		justify-content: center;
		align-items: center;
		align-content: center;
		
	}
	
	.modal-content{
		width:auto;
		height:auto;
		background:var(--modalForegroundColor);
		padding:2em;
	}
</style>