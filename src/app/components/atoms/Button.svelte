<script>
	export let backgroundColor = "#505050";
	export let foregroundColor = "#FFF";
	export let width = "auto";
	export let height = "4em";
	export let style = "";
	export let outline = false;
	export let type = "submit";
	
	let buttonStyle = `
		--backgroundColor:${backgroundColor};
		--foregroundColor:${foregroundColor};
		--width:${width};
		--height:${height};
		${style}
	`

</script>

<button type="{type}" class="button" class:outline={outline} style={buttonStyle} on:click>
    <slot></slot>
</button>

<style>
	.button{
    	display: inline-block;
	 	padding:1em 2em;
		width: var(--width);
		height: var(--height);
		border-radius:var(--borderRadius);
		box-sizing: border-box;
		color:var(--foregroundColor);
		background-color:var(--backgroundColor);
		text-align:center;
		transition: all 0.25s;
		border: thin var(--backgroundColor) solid;
		font-weight:500;
		cursor:pointer;
	}
	.button.outline{
		background:transparent;
		border: thin var(--backgroundColor) solid;
		color: var(--backgroundColor);
	}

	.button.outline:hover{
		background:var(--backgroundColor);
		color: var(--foregroundColor);
	}
	
	.button:hover{
		/* filter: brightness(0.9); */
	}
	
	.button:active{
		background: var(--backgroundColor);
		outline: none;
		border:none;
		/* filter: brightness(0.8); */
	}
	.button:focus{
		
		outline: none;
		/* filter: brightness(0.8); */
	}
	
@media all and (max-width:30em){
	.button{
		display:block;
		margin: 0.2em auto;
	}
}
</style>
