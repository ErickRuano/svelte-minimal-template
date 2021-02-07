<script>
import { getContext, onMount } from "svelte";
import { Auth, Input } from '../../components'
import { push, querystring } from "svelte-spa-router";

const { client, session } = getContext('services');

import LoginForm from './loginForm.partial.svelte'

// Model
    
    let user = {
        username : "",
        password : ""
    }

    let userSession;


</script>

<Auth>
    <LoginForm {user}></LoginForm>
</Auth>
