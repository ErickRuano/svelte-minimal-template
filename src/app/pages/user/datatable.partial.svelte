<script>
    import { Table } from './../../components'

        export let data = []
    

    const settings = {
        valueNames : [
            'email',
            'password'
        ]
    }
    


</script>

<Table let:output-rows={rows} let:output-headers={headers} data={data} options={settings}>
<input class="search" placeholder="Search" />
<table >
    <thead>
        <tr>
            <th class="sort" data-sort="email">Email</th>
            <th class="sort" data-sort="password">Password</th>
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
            <td class="email">
            { row.email }
            <td class="password">
            { row.password }
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