<script>

import { formatDate } from './../../helpers/'

export let title = "APP"

export let user = {
    picture : "https://avatars.dicebear.com/4.5/api/bottts/%7Bmars%7D.svg",
    displayName : "User"
}

export let style = "";

</script>

<style>

    .webnav-container{
        display:flex;
        justify-content: space-between;
        width:100%;
        box-sizing: border-box;
        align-content: center;
        align-items: center;
    }
    
    .avatar-holder{
        border-radius:50%;
        width:2em;
        height:2em;
        overflow:hidden;
        box-sizing: border-box;
        margin-right:1em;
    }

    .avatar-holder img{
        width:100%;
        height:100%;
    }

    b{
        font-size:18px;
        text-align:center;
        width:100%;
        margin-left:2em;
    }

    .user-holder{
        display:flex;
        width:auto;
        align-items: center;
        justify-content: center;
        justify-items: center;
    }

    @media (min-width:1281px) {
        .webnav-container{
            padding: 0em 8em;
        }
    }
</style>


    <div class="webnav-container" {style}>

        <b>{title}</b>

        <span class="user-holder">
            <div class="avatar-holder">
                <img src="{user.picture}" alt="{user.displayName}'s profile picture" width="100%" height="100%">
            </div>
        </span>
        
        
    </div>
