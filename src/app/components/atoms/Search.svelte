<script>
 import { mdiMagnify } from '@mdi/js';

 export let placeholder = "Search something here"
</script>

<style>
    .search-container{
        height:2em;
        min-width:360px;
        max-width:480px;
        width:100%;
        display:flex;
        justify-content: space-between;
        align-items: center;
        justify-items: center;
        background:#F2F2F2;
        padding:0.5em 1em;
        border-radius:0.25em;
        margin-bottom:2em;
    }

    .search-container input{
        width:100%;
        margin-right:0.5em;
        border:none;
        background: #F2F2F2;
        
    }

    .search-container input:focus{
        outline: none;
    }

    ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: #BABABA;
}

:-ms-input-placeholder { /* Internet Explorer 10-11 */
 color: #BABABA;
}

::-ms-input-placeholder { /* Microsoft Edge */
  color: #BABABA;
}


</style>

<div class="search-container">
    <input {placeholder} />
    <svg style="width:2em;height:2em;" viewbox="0 0 24 24">
        <path fill="#CACACA" d="{mdiMagnify}" />
    </svg>
</div>

