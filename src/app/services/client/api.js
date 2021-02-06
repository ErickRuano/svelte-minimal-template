import axios from 'axios'

const client = axios.create({
    // baseURL: 'http://localhost:3002/',
    // timeout: 1000
})

const apiRequest = async (method, url, request)=>{
    console.log(`http://localhost:3001/${url}`)
    return await client({
        method,
        url : `http://localhost:3001/${url}`,
        data : request
    })
}

const get = async(url, request) => apiRequest("get", url, request)
const post = async(url, request) => apiRequest("post", url, request)
const put = async(url, request) => apiRequest("put", url, request)
const deleteRequest = async(url, request) => apiRequest("delete", url, request)

const API = {
    instance : client,
    get,
    post,
    put,
    delete : deleteRequest
}

export default API