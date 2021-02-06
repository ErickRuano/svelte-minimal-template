<script>
    import { Table, Button, Modal, Input } from './../../components'
    import { getContext, onMount  } from "svelte";
    const { client, session } = getContext("services")

        export let data = []

        let new{{displayName}} = {
            {{#if createdByUser}}
            "userId" : session.getSession().user.id,
            {{/if}}
            {{#each fields}} 
            "{{id}}" : ""{{#if @last}}{{else}},{{/if}}
            {{/each}},
        }
        let selected{{displayName}};

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
            {{#each fields}}
            '{{id}}'{{#if @last}}{{else}},{{/if}}
            {{/each}}
        ]
    }

    onMount(async ()=>{
		const res  = await client.{{id}}.findMany()
        data = [...res]
    })
    
   const handleCreate = async()=>{
        modal.hide()
        let res = await client.{{id}}.create(new{{displayName}})
        if(res.id){
            data = []
           res  = await client.{{id}}.findMany()
           data = [...res]
        }

    }

    const handleUpdate = async()=>{
        modal.hide()
        let id = selectedApp.id
        delete selectedApp.id
        let res = await client.{{id}}.update(id, selected{{displayName}})
        if(res.id){
        data = []
           res  = await client.{{id}}.findMany()
           data = [...res]
        }

    }

      const handleDelete = async()=>{
        modal.hide()
        let res = await client.{{id}}.delete(selected{{displayName}}.id)
        let target = null
        if(res.id){
           data = []
           res  = await client.{{id}}.findMany()
           data = [...res]
        }

    }
    
    


</script>

    {#if data.length}
<Table  options={settings}>
<div class="controls-container" >
    <Input search placeholder="Search" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;"  />
    <Button backgroundColor="var(--theme-secondary)" width="12em" outline on:click={()=>{ modal.create = true;  }}>New {{displayName}}</Button>
</div>
<table >
    <thead>
        <tr>
            {{#each fields}}
            <th class="sort" data-sort="{{id}}">{{displayName}}</th>
            {{/each}}
            <th>Update</th>
            <th>Delete</th>
        </tr>
    </thead>
    <tbody class="list">

    {#each data as row, i}
        <tr>
            {{#each fields}}
            <td class="{{id}}">
            { row.{{id}} }
            {{/each}}
            <td width="8em"><Button width="8em" outline on:click={()=>{ modal.update = true; selected{{displayName}} = row }}>Update</Button></td>
            <td width="8em"><Button width="8em" outline on:click={()=>{ modal.delete = true;  modal.target = i; selected{{displayName}} = row }} }}>Delete</Button></td>
        </tr>
    {/each}
    </tbody>
</table>
</Table>
    {/if}

<Modal bind:visible={modal.create} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    <h3>Create a new {{displayName}}</h3>
    {{#each fields}}
    {{#if isBoolean}}
    <Input type="checkbox" placeholder="{{displayName}}" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={new{{../displayName}}.{{id}} }/>
    {{else}}
    <Input placeholder="{{displayName}}" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={new{{../displayName}}.{{id}} }/>
    {{/if}}
    {{/each}}
    <div style="display:flex;flex-direction:row;justify-content:space-around;">
        <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleCreate}>Create {{displayName}}</Button>
        <Button width="100%" outline on:click={()=>{ modal.hide() }}>Cancel</Button>
    </div>
</Modal>

<Modal bind:visible={modal.update} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    <h3>Update {{displayName}}</h3>
    {{#each fields}}
    {{#if isBoolean}}
    <Input type="checkbox" placeholder="{{displayName}}" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={selected{{../displayName}}.{{id}} }/>
    {{else}}
    <Input placeholder="{{displayName}}" backgroundColor="var(--theme-light-gray)" foregroundColor="var(--theme-dark-gray)" style="margin-right:2em;" bind:value={selected{{../displayName}}.{{id}} }/>
    {{/if}}
    {{/each}}
    <div style="display:flex;flex-direction:row;justify-content:space-around;">
        <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleUpdate}>Update {{displayName}}</Button>
        <Button width="100%" outline on:click={()=>{ modal.hide() }}>Cancel</Button>
    </div>
</Modal>

<Modal bind:visible={modal.delete} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    <h3>Delete {{displayName}}</h3>
    <div style="display:flex;flex-direction:row;justify-content:space-around;">
        <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleDelete}>Delete {{displayName}}</Button>
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