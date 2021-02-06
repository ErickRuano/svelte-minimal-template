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

// Methods
const login = async ()=>{
    try{
        userSession = await client.auth.signIn(user);
        session.setSession(userSession);
        push('/app')
    }catch(err){
        alert('login failed')
    }
}
</script>

<Auth>
    <LoginForm {user}></LoginForm>
</Auth>
