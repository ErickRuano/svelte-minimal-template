import API from './api.js'

export const signIn = async (data, config)=>{
    return await API.post(`auth/signIn`, data, config)
}

export const forgotPassword = async (data, config)=>{
    return await API.post(`auth/reset`, data, config)
}

export const confirmPassword = async (data, config)=>{
    return await API.put(`auth/reset`, data, config)
}

export const self = async (config)=>{
    return await API.get(`auth/self`, config)
}