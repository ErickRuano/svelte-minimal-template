<script>
    import { Table, Button, Modal, Input } from './../../components'
    import { getContext, onMount  } from "svelte";
    const { client, session } = getContext("services")

        export let data = []

        let newApp = {
            "userId" : session.getSession().user.id,
            "text" : "",
                        "isPublished" : "",
                        "detail" : ""
            ,
        }
        let selectedApp;

        const initialModal = {
            create : false,
            update : false,
            delete : false,
            hide : ()=>{
                modal = {...initialModal}
            }
        }

        let modal = {...initialModal}
        
    

    const settings = {
        valueNames : [
            'text',
            'isPublished',
            'detail'
        ]
    }

    onMount(async ()=>{
		const res  = await client.app.findMany()
        data = [...res]
    })
    
   const handleCreate = async()=>{
        modal.hide()
        let res = await client.app.create(newApp)
        if(res.id){
            data = []
           res  = await client.app.findMany()
           data = [...res]
        }

    }

    const handleUpdate = async()=>{
        modal.hide()
        let id = selectedApp.id
        delete selectedApp.id
        let res = await client.app.update(id, selectedApp)
        if(res.id){
        data = []
           res  = await client.app.findMany()
           data = [...res]
        }

    }

      const handleDelete = async()=>{
        modal.hide()
        let res = await client.app.delete(selectedApp.id)
        let target = null
        if(res.id){
           data = []
           res  = await client.app.findMany()
           data = [...res]
        }

    }
    
    


</script>

    {#if data.length}
<Table  options={settings}>
<div class="controls-container" >
    <Input search placeholder="Search" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;"  />
    <Button backgroundColor="var(--theme-secondary)" width="12em" outline on:click={()=>{ modal.create = true;  }}>New App</Button>
</div>
<table >
    <thead>
        <tr>
            <th class="sort" data-sort="text">Text</th>
            <th class="sort" data-sort="isPublished">IsPublished</th>
            <th class="sort" data-sort="detail">Detail</th>
            <th>Update</th>
            <th>Delete</th>
        </tr>
    </thead>
    <tbody class="list">

    {#each data as row, i}
        <tr>
            <td class="text">
            { row.text }
            <td class="isPublished">
            { row.isPublished }
            <td class="detail">
            { row.detail }
            <td width="8em"><Button width="8em" outline on:click={()=>{ modal.update = true; selectedApp = row }}>Update</Button></td>
            <td width="8em"><Button width="8em" outline on:click={()=>{ modal.delete = true;  modal.target = i; selectedApp = row }} }}>Delete</Button></td>
        </tr>
    {/each}
    </tbody>
</table>
</Table>
    {/if}

<Modal bind:visible={modal.create} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    <h3>Create a new App</h3>
    <Input placeholder="Text" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={newApp.text }/>
    <Input type="checkbox" placeholder="IsPublished" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={newApp.isPublished }/>
    <Input placeholder="Detail" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={newApp.detail }/>
    <div style="display:flex;flex-direction:row;justify-content:space-around;">
        <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleCreate}>Create App</Button>
        <Button width="100%" outline on:click={()=>{ modal.hide() }}>Cancel</Button>
    </div>
</Modal>

<Modal bind:visible={modal.update} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    <h3>Update App</h3>
    <Input placeholder="Text" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={selectedApp.text }/>
    <Input type="checkbox" placeholder="IsPublished" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={selectedApp.isPublished }/>
    <Input placeholder="Detail" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={selectedApp.detail }/>
    <div style="display:flex;flex-direction:row;justify-content:space-around;">
        <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleUpdate}>Update App</Button>
        <Button width="100%" outline on:click={()=>{ modal.hide() }}>Cancel</Button>
    </div>
</Modal>

<Modal bind:visible={modal.delete} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    <h3>Delete App</h3>
    <div style="display:flex;flex-direction:row;justify-content:space-around;">
        <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleDelete}>Delete App</Button>
        <Button width="100%" outline on:click={()=>{ modal.hide() }}>Cancel</Button>
    </div>
</Modal>



<style>

.controls-container{
     display:flex;
     justify-content: space-around;
}

h3{
    margin-bottom:2em;
    font-size:1.5em;
    text-align:center;
}

</style>