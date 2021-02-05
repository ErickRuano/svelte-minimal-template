<script>

    export let data = []

    const settings = {
        sortable: true,
        pagination: true,
        rowPerPage: 5,
        columnFilter: true,
    }

    import List from 'list.js'

    


</script>


<table id="datatable">
    <thead>
        <th data-key="email">Email</th>
        <th data-key="password">Password</th>
    </thead>
    <tbody>
    {#each data as row, i}
        <tr>
            <td>
            { row.email }
            </td>
            <td>
            { row.password }
            </td>
        </tr>
    {/each}
    </tbody>
</table>

<style>
#datatable {
    border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.9em;
    font-family: sans-serif;
    min-width: 400px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    width:100%;
}

#datatable thead tr {
    background-color: #009879;
    color: #ffffff;
    text-align: left;
}

#datatable th,
#datatable td {
    padding: 12px 15px;
    text-align: left;
}
#datatable tbody tr {
    border-bottom: 1px solid #dddddd;
}

#datatable tbody tr:nth-of-type(even) {
    background-color: #f3f3f3;
}

#datatable tbody tr:last-of-type {
    border-bottom: 2px solid var(--theme-secondary);
}
#datatable tbody tr.active-row {
    font-weight: bold;
    color: #009879;
}
</style>