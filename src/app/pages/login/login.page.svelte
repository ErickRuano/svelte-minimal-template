<script>
import { Auth } from '../../components'

import { getContext } from "svelte";
import { push } from "svelte-spa-router";

const { client, session } = getContext('services');
    
    let user = {
        username : "",
        password : ""
    }

    let userSession;


const login = async ()=>{
    try{
        userSession = await client.auth.signIn(user);
        session.setSession(userSession);
        push('/home')
    }catch(err){
        alert('login failed')
    }
}
</script>

<Auth>

    <section slot="header">
        Header
	</section>

	<section slot="nav">
        Nav
	</section>

	<section slot="main" >
	    Hello
  	</section>
      
</Auth>