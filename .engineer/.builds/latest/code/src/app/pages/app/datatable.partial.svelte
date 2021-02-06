<script>
    import { Table } from './../../components'

        export let data = []
    

    const settings = {
        valueNames : [
            'text'
            'isPublished'
            'detail',
        ]
    }
    


</script>

<Table let:output-rows={rows} let:output-headers={headers} data={data} options={settings}>
<input class="search" placeholder="Search" />
<table >
    <thead>
        <tr>
            <th class="sort" data-sort="text">Text</th>
            <th class="sort" data-sort="isPublished">IsPublished</th>
            <th class="sort" data-sort="detail">Detail</th>
        </tr>
    </thead>
    <tbody class="list">
    {#if !rows.length}
    <tr>
        <td>-</td>
        <td>-</td>
        <td>-</td>
    </tr>
    {/if}
    {#each rows as row, i}
        <tr>
            <td class="text">
            { row.text }
            <td class="isPublished">
            { row.isPublished }
            <td class="detail">
            { row.detail }
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