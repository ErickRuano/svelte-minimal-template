/**
 * 
 */
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

module.exports = async (config)=>{
  
  for(let i = 0; i < config.data.schema.length ; i++){
    config.data.schema[i].displayName = capitalize(config.data.schema[i].id)
    for(let ii = 0; ii < config.data.schema[i].fields.length; ii++){
      config.data.schema[i].fields[ii].displayName = capitalize(config.data.schema[i].fields[ii].id).split('-').join(' ')
      console.log(config.data.schema[i].fields[ii])
      if(config.data.schema[i].fields[ii].type === 'Boolean'){
        config.data.schema[i].fields[ii].isBoolean = true
      }
      
    }
    // Parents
    if(Array.isArray(config.data.schema[i].parents)){
      config.data.schema[i].parents = config.data.schema[i].parents.map((parent)=>{
        if(parent.id === 'user'){
          config.data.schema[i].createdByUser = true
        }
        parent.capitalized = `${parent.id[0].toUpperCase()}${parent.id.substring(1)}`
        return parent
      })
    }
  }



  return config
}