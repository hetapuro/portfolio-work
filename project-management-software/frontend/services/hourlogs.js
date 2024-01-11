import axios from 'axios'
const baseUrl = ''

const getAll = async () => {
    const response = await axios.get(baseUrl)
    return response.data
}

const getPersonal = async (id) => { 
    const response = await axios.get(`${baseUrl}/${id}`)
    return response.data
}

const create = async (newObject) => {
    const response = await axios.post(baseUrl, newObject)
    return response.data
}

const update = async (id, newObject) => {
    const response = await axios.patch(`${baseUrl}/${id}`, newObject)
    return response.data
}

const updateMany = async (id, data) => {
    const response = await axios.patch(`${baseUrl}/updateMany/${id}`, data)
    return response.data
}

const deleteHourlog = async (id) => {
    const response = await axios.delete(`${baseUrl}/${id}`)
    return response.data
}

export default {
    getAll,
    getPersonal,
    create,
    update,
    updateMany,
    deleteHourlog
}