<script>
	import {onMount } from 'svelte'
	import List from 'list.js'
	
	export let data = []
	let rows = data;
	let headers = []
	
	export let options = {
		valueNames : [] // This should be obtained from data headers
    }
    console.log('options', options)

	export let headerBackground = "var(--theme-secondary)";
	export let headerColor = "#FFF";
	export let evenBackground = "#FFF";
	export let evenColor = "inherit";
	export let oddBackground = "#F3F3F3";
	export let oddColor = "inherit";
	export let style = "";
	let tableStyle = `
		--headerBackground: ${headerBackground};
		--headerColor: ${headerColor};
		--evenBackground: ${evenBackground};
		--evenColor: ${evenColor};
		--oddBackground: ${oddBackground};
		--oddColor: ${oddColor};
		${style}
	`



		
	onMount(()=>{
		var tableList = new List('simple-datatable', options);
	})
	


</script> 

<div id="simple-datatable" style={tableStyle}>
		<slot output-rows={rows} output-headers={headers}></slot>	
</div>

<style>
#simple-datatable :global(table) {
    border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.9em;
    font-family: sans-serif;
    min-width: 400px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    width:100%;
}

#simple-datatable :global(thead tr) {
    background-color: var(--headerBackground);
    color:var(--headerColor);
    text-align: left;
}

#simple-datatable :global(th),
#simple-datatable :global(td) {
    padding: 12px 15px;
    text-align: left;
}
#simple-datatable :global(tbody tr) {
    border-bottom: thin solid #dddddd;
	background-color:var(--oddBackground);
	color:var(--oddColor)!important;
}

#simple-datatable :global(tbody tr:nth-of-type(even)) {
    background-color:var(--evenBackground);
}

#simple-datatable :global(tbody tr:last-of-type) {
    border-bottom: thin solid var(--headerBackground);
}
#simple-datatable :global(tbody tr.active-row) {
    font-weight: bold;
    color: var(--headerBackground);
}


#simple-datatable :global(.sort):after {
  display:inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid transparent;
  content:"";
  position: relative;
  top:-10px;
  right:-5px;
}
#simple-datatable :global(.sort).asc:after {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #fff;
  content:"";
  position: relative;
  top:4px;
  right:-5px;
}
#simple-datatable :global(.sort).desc:after {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #fff;
  content:"";
  position: relative;
  top:-4px;
  right:-5px;
}
</style>