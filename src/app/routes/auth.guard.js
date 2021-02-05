export default (detail)=>{
    const hasSession = localStorage.getItem('session') ? true : false ;
    if(hasSession && detail.location == '/login'){
        return false
    }
    if(!hasSession && detail.location == '/login'){
        return true 
    }
    return hasSession
}