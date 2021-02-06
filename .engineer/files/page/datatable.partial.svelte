<script>
    import { Table } from './../../components'

        export let data = []
    

    const settings = {
        valueNames : [
            {{#each fields}}
            '{{id}}'{{#if @last}}{{else}},{{/if}}
            {{/each}}
        ]
    }
    


</script>

<Table let:output-rows={rows} let:output-headers={headers} data={data} options={settings}>
<input class="search" placeholder="Search" />
<table >
    <thead>
        <tr>
            {{#each fields}}
            <th class="sort" data-sort="{{id}}">{{displayName}}</th>
            {{/each}}
        </tr>
    </thead>
    <tbody class="list">
    {#if !rows.length}
    <tr>
        {#each settings.valueNames as header, i}
        <td>-</td>
        {/each}
    </tr>
    {/if}
    {#each rows as row, i}
        <tr>
            {{#each fields}}
            <td class="{{id}}">
            { row.{{id}} }
            {{/each}}
        </tr>
    {/each}
    </tbody>
</table>
</Table>

<style>
.search{
    width:100%;
    padding:1em;
    height:2em;
    box-sizing: border-box;
}
</style>