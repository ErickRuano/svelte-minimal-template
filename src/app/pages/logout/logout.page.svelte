<script>
import { onMount } from "svelte";
import { Auth } from '../../components'


onMount(()=>{
    localStorage.clear()
    location.href = "#/login"
})
</script>

<Auth>

</Auth>
