<script>
	export let backgroundColor = "#FFF";
	export let foregroundColor = "#DDD";
	export let width = "auto";
	export let height = "auto";
	export let style = "";
	
	let buttonStyle = `
		--backgroundColor:${backgroundColor};
		--foregroundColor:${foregroundColor};
		--width:${width};
		--height:${height};
		${style}
	`
</script>

<button class="button" on:click style={buttonStyle}>
    <slot></slot>
</button>

<style>
	.button{
    display: inline-block;
	 	padding:1em;
		min-width:1em;
		min-height:1em;
		width: var(--width);
		height: var(--height);
		border-radius:var(--borderRadius);
		box-sizing: border-box;
		color:var(--foregroundColor);
		background-color:var(--backgroundColor);
		text-align:center;
		transition: all 0.2s;
		border: thin var(--backgroundColor) solid;
		font-weight:500;
		cursor:pointer;
	}
	
	.button:hover{
		filter: brightness(0.95);
	}
	
	.button:active{
		background: var(--backgroundColor);
		filter: brightness(0.8);
	}
	
@media all and (max-width:30em){
	.button{
		display:block;
		margin: 0.2em auto;
	}
}
</style>
