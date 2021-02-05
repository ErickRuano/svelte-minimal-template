export default function (config) {
    const session = localStorage.getItem('session')
    if(session){
      config.headers.Authorization =  JSON.parse(session).id_token || null
    }
    return config
  }