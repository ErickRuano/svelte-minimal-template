const setSessionService = (session)=>{
    localStorage.setItem('session', JSON.stringify(session))
}

const getSessionService = ()=>{
    return JSON.parse(localStorage.getItem('session'))
}

export default {
    getSession : getSessionService,
    setSession : setSessionService
}

export const getSession = getSessionService;
export const setSession = setSessionService;