import API from './client/api.js'

const readService = async (id)=>{
    return await API.get(`api/webhook/${id}`)
}

const writeService = async (id, data)=>{
    
}

export default {
    read : readService,
    write : writeService
}

export const read = readService;
export const write = writeService;