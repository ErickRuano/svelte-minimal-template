<script>

import { formatDate } from './../../helpers/'
import { location, push } from 'svelte-spa-router'


export let links = [
    {
        url : "/user",
        display : "User"
    },
    {
        url : "/app",
        display : "App"
    }
]

export let style = "";

</script>

<style>

    .aside-container{
        display:grid;
        grid-template-columns: 1fr;
        grid-template-rows: 4em 1fr;
        grid-template-areas: "logo" "nav";
        justify-content: flex-start;
        width:100%;
        align-content: center;
        align-items: flex-start;
        box-sizing: border-box;
        padding: 0em 0em 0em 0em;
    }

    .avatar-holder{
        grid-area:logo;
        display:flex;
        justify-content:center;
        align-content:center;
        align-items:center;
        padding:1em;
    }

    
    ul{
          list-style-type: none;
          width:100%;
          padding:2em 0em;
          box-sizing: border-box;
          grid-area: nav;
          display:flex;
          flex-direction:column;
          align-items:flex-start;
          align-content:flex-start;
    }

    ul li{
        height:5em;
        padding: 1em 0em;
        text-align:left;
        box-sizing: border-box;
        cursor:pointer;
        width: 100%;
    }

    ul li.selected{
        background:lightgray;
    }

    p{
        color: var(--theme-black);
        margin-bottom:0.5rem;
        text-align: center;
    }
    
    @media (min-width:1281px) {
        /* .aside-container{
            padding: 0em 8em;
        } */
    }
</style>


    <div class="aside-container" {style}>

        <section class="avatar-holder">
            <img width="75%" margin="auto" height="auto" src="https://avatars.dicebear.com/4.5/api/bottts/%7Bmars%7D.svg" alt="Logo">
        </section>

        <ul>
            {#each links as link, i}
            <li class:selected={$location === link.url} on:click={()=>{ push(`#${link.url}`) }}>
                <p>{link.display}</p>
            </li>
            {/each}
        </ul>
        
        
    </div>
