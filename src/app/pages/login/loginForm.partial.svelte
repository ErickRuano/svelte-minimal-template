<script>
    import {getContext, onMount } from 'svelte'
    import qs from 'qs';
    import { push, querystring } from "svelte-spa-router";
    import { Input, Button } from './../../components'
    const { session, client } = getContext('services');
    
    export let user;

    const loginWith = (provider)=>{
        
        location.replace( `http://localhost:3001/auth/${provider}`, self, '')
        return false;
    }

    onMount(async ()=>{
        if(qs.parse($querystring).token){
            // session.setSession({ id_token : qs.parse($querystring).token });
            const sessionUser = await client.auth.self(qs.parse($querystring).token)
            session.setSession({ id_token : qs.parse($querystring).token, user : sessionUser.oAuthData})
            push('/app')
        }
    })


</script>

<form class="loginForm">
    <h1>Instantcode</h1>
    <p>Sign in with your social account</p>
    <!-- <Input outline backgroundColor="--theme-primary" type="text" placeholder="Username"></Input>
    <Input outline backgroundColor="--theme-primary" type="password" placeholder="Password"></Input> -->
    <!-- <Button style="border-radius:10px;margin-bottom:1em;">Sign In</Button> -->
    <div class="socialLogin">
        <Button type="reset" style="border-radius:10px;margin-bottom:1em;margin-right:1em;box-sizing: border-box;" backgroundColor="white"  width="calc(50% - 0.5em);" on:click={()=>{ loginWith('google') }}><img src="img/google.svg" alt="google" ></Button>
        <Button type="reset" style="border-radius:10px;margin-bottom:1em;box-sizing: border-box;" backgroundColor="black"  width="calc(50% - 0.5em);"  on:click={()=>{ loginWith('github') }}><img src="img/github.png" alt="github"></Button>
    </div>
</form>      

<style>
h1{
    
    text-align:center;
    
}
p{
    text-align:center;
    width:100%;
    font-weight:500;
    margin-bottom:2em;
    
}
form{
    width:18em;
    height:auto;
    display:flex;
    flex-direction: column;
    background: #FFF;
    border-radius:2em;
    padding:4em;
background: rgba( 255, 255, 255, 0.5 );
box-shadow: 0 8px 32px 0 rgba(133, 133, 133, 0.1);
backdrop-filter: blur( 4px );
-webkit-backdrop-filter: blur( 8px );
border-radius: 10px;
border: 1px solid rgba( 255, 255, 255, 0.18 );
}

.loginForm :global(input){
    background: rgba( 255, 255, 255, 0.25 );
box-shadow: 0 8px 32px 0 rgba(133, 133, 133, 0.1);
backdrop-filter: blur( 4px );
-webkit-backdrop-filter: blur( 4px );
border-radius: 10px;
border: 1px solid rgba( 255, 255, 255, 0.18 );
}

.loginForm img{
    margin-bottom:2em;
}

.socialLogin{
    display:flex;
    box-sizing: border-box;
    justify-content: space-around;
    width:100%;
}

.socialLogin :global(button){
    text-align:center;
}

.socialLogin :global(button img){
    height:100%;
}
</style>