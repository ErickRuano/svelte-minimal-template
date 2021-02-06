<script>
    export let background = "url(https://source.unsplash.com/random/1920x1080) no-repeat center center fixed";
    export let style = "";

    $: mainStyle = `
      --loginBackground: ${background}
      ${style}
    `
</script>

<style>

  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items:center;
    align-content:center;
    overflow: auto;
    background: var(--loginBackground);
    background-size: cover;
  }


</style>

<main style={mainStyle}>
  <slot/>
</main>
