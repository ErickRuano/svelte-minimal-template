<script>
</script>

<style>
/* Mobile First*/

 .layout{
    width:100%;
    height:100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 6em 1fr 6em;
    grid-template-areas: "nav" "main" "footer";
    box-sizing:border-box;
  }

  nav#mobNav{
    height: auto;
    background: var(--theme-background);
    width:100%;
    grid-area: nav;
    padding:1em 4em 1em 4em;
    box-sizing: border-box;
    color: var(--theme-black);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  nav#webNav{
    display:none;
  }
  
  aside {
    display:none;
  }

  header {
    display:none;
  }

  main {
    grid-area: main;
    padding:2em 2em 2em 2em;
    box-sizing: border-box;
  }

  footer{
    grid-area:footer;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }


@media (min-width:801px) {
  .layout{
    grid-template-columns: 8em 1fr;
    grid-template-rows: 4em 6em 1fr;
    grid-template-areas: "nav nav" "aside header" "aside main";
  }

  aside {
    padding:0em;
    grid-area: aside;
    width: auto;
    display: flex;
    box-sizing:border-box;
    background:var(--theme-white);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }

  
  header {
    grid-area: header;
    height: 100%;
    border-radius: 0 0em 0em 0em;
    padding:2em;
    box-sizing: border-box;
    display:flex;
  }

  main {
    padding:0em 2em;
    box-sizing: border-box;
  }

  
  nav#webNav{
    display:flex;
    height: auto;
    background:var(--theme-primary);
    width:100%;
    grid-area: nav;
    padding:1em 4em 1em 4em;
    box-sizing: border-box;
    color: var(--theme-white);
  }

  footer{
    display:none;
  }

  #mobNav{
    display:none;
  }
  #webNav{
    display:flex;
  }

}

@media (min-width:1365px) { 

    .layout{
      grid-template-columns: 8em 1fr;
      grid-template-rows: 4em 6em 1fr;
    }

    aside {
      padding:0em;
    }
    header {
      padding:2em;
    }
    main {
      padding:0em 2em;
    }
  

  
 }

  

</style>

<div class="layout">
  <nav id="webNav">
    <slot name="webnav" />
  </nav>

  <nav id="mobNav">
    <slot name="mobnav" />
  </nav>
  
  <aside>
    <slot name="aside" />
  </aside>

  <header>
    <slot name="header" />
  </header>

  <main>
    <slot name="main" />
  </main>

  <footer>
    <slot name="footer"/>
  </footer>
  
</div>