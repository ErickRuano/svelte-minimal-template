<script>
    import { Datatable, rows } from 'svelte-simple-datatables'

    export let data = []

    const settings = {
        sortable: true,
        pagination: true,
        rowPerPage: 50,
        columnFilter: true,
    }


</script>

<Datatable settings={settings} data={data}>
    <thead>
    </thead>
    <tbody>
    {#each $rows as row}
        <tr>
        </tr>
    {/each}
    </tbody>
</Datatable>