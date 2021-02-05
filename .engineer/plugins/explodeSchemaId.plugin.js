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
    }
  }



  return config
}