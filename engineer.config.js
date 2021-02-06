const explodeSchemaId = require("./.engineer/plugins/explodeSchemaId.plugin");

const main = async ()=>{

  let config = {
    "data" : require('./../instantcode.schema.json'),
    "fileTemplates" : [
      {
        "src" : "./.engineer/files/page/page.svelte",
        "dest" : "./src/app/pages/[id]/[id].page.svelte",
        "key" : "schema"
      },
      {
        "src" : "./.engineer/files/page/datatable.partial.svelte",
        "dest" : "./src/app/pages/[id]/datatable.partial.svelte",
        "key" : "schema"
      },
      {
        "src" : "./.engineer/files/entity.service.js",
        "dest" : "./src/app/services/client/[id].service.js",
        "key" : "schema"
      },
      {
        "src" : "./.engineer/files/client.index.js",
        "dest" : "./src/app/services/client/index.js"
      },
      {
        "src" : "./.engineer/files/pages.index.js",
        "dest" : "./src/app/pages/index.js"
      },
      {
        "src" : "./.engineer/files/routes.index.js",
        "dest" : "./src/app/routes/index.js"
      },
      {
        "src" : "./.engineer/files/components/Aside.svelte",
        "dest" : "./src/app/components/molecules/Aside.svelte"
      }
    ]
  }

  config = await explodeSchemaId(config)
  console.log(config.data.schema)
  return config


}

module.exports = main()