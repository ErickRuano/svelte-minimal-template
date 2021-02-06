import API from './api.js'
import qs from "qs"

const createService = async (data, query = {}, config) => {
    return await API.post(`api/app?${qs.stringify(query)}`, data, config)
}

const deleteService = async (resource = "undefined", query, config) => {
    
        return await API.delete(`api/app/${resource}?${qs.stringify(query)}`, config)
    
}

const updateService = async (resource = "undefined", data, query = {}, config) => {
    return await API.put(`api/app/${resource}?${qs.stringify(query)}`, data, config)
}

const findManyService = async (query = {}, config) => {
    return await API.get(`api/app?${qs.stringify(query)}`, config)
}

const findOneService = async (resource = "undefined", query, config) => {
    return await API.get(`api/app/${resource}?${qs.stringify(query)}`, config)
}

export default {
    create: createService,
    delete: deleteService,
    update: updateService,
    findMany: findManyService,
    findOne: findOneService
}
