<script>
 export let placeholder = "";
 export let type = "text";
 export let value;
 export let search;
 console.log(search)

 	export let backgroundColor = "#FFF";
	export let foregroundColor = "#DDD";
	export let width = "100%";
	export let height = "4em";
	export let style = "";
    export let outline;
    
	
	let inputStyle = `
		--backgroundColor:${backgroundColor};
		--foregroundColor:${foregroundColor};
		--width:${width};
		--height:${height};
		${style}
	`
</script>

<style>

   input.outline{
        background:transparent!important;
        border: none;
        color: var(--backgroundColor)!important;
    }

    .input-container.outline{
        background:transparent!important;
        border: thin var(--backgroundColor) solid!important;   
    }

    .input-container{
        box-sizing: border-box!important;
        width:var(--width);
        height:auto;
        display:flex;
        justify-content: center;
        align-items: center;
        justify-items: center;
        background:var(--backgroundColor);
        margin-bottom:2em;
    }

    .input-container input{
        height:var(--height);
        width:var(--width);
        box-sizing: border-box;
        border:none;
        background:var(--backgroundColor);
        color: var(--foregroundColor);
        padding: 1em 2em;
    }

    .input-container input:focus{
        outline: none;
    }

    input::placeholder {        
        color: var(--backgroundColor);
        filter: brightness(0.75)
    }

    input.outline::placeholder {        
        color: var(--backgroundColor);
        filter: opacity(0.8)
    }


</style>
<div class="input-container" class:outline={outline} class:search={search} style={inputStyle}>
    {#if type === 'text'}
    <input type="text" class:outline={outline} {placeholder} bind:value={value} />
    {:else if type === 'number'}
    <input type="number" class:outline={outline} {placeholder} bind:value={value} />
    {:else if type === 'password'}
    <input type="password" class:outline={outline} {placeholder} bind:value={value} />
    {:else if type === 'checkbox'}
    <input type="checkbox" class:outline={outline} {placeholder} bind:checked={value} />
    {:else}
    <input type="text" class:outline={outline} {placeholder} bind:value={value} />
    {/if}
</div>

