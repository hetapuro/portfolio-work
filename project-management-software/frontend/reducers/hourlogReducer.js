import { createSlice } from '@reduxjs/toolkit'
import hourlogService from '../services/hourlogs'

const hourlogSlice = createSlice({
    name: 'hourlogs',
    initialState: [],
    reducers: {
        changeHourlog(state, action) {
            const id = action.payload.id
            const updatedHourlog = action.payload.hourlog
            const hourlogIndex = state.findIndex(h => h.id === id);

            if (hourlogIndex !== -1) 
                state[hourlogIndex] = { ...state[hourlogIndex], ...updatedHourlog }
        },
        changeMany(state, action) {
            const id = action.payload.id
            const updatedHourlog = action.payload.update.status

            state = state.map(hourlog =>
                hourlog.projectID !== id || hourlog.status !== action.payload.update.prevStatus ? hourlog : {...hourlog, updatedHourlog})
        },
        removeHourlog(state, action) {
            const id = action.payload

            return state.filter(h => h.id !== id)
        },
        appendHourlog(state, action) {
            state.push(action.payload)
        },
        setHourlogs(state, action) {
            return action.payload
        }
    }
})

export const { changeHourlog, changeMany, removeHourlog, appendHourlog, setHourlogs } = hourlogSlice.actions

export const initializeHourlogs = () => {
    return async dispatch => {
        const hourlogs = await hourlogService.getAll()
        dispatch(setHourlogs(hourlogs))
    }
}

export const initializePersonalHourlogs = (id) => {
    return async dispatch => {
        const hourlogs = await hourlogService.getPersonal(id)
        dispatch(setHourlogs(hourlogs))
    }
}

export const createHourlog = hourlog => {
    return async dispatch => {
        try {
            const newHourlog = await hourlogService.create(hourlog)
            dispatch(appendHourlog(newHourlog))

            return { success: true }
        } catch (error) {
            return { success: false, error: error.response.data.error }
        }
    }
}

export const updateHourlog = (id, hourlog) => {
    return async dispatch => {
        try {
            const updatedHourlog = await hourlogService.update(id, hourlog)
            dispatch(changeHourlog({id: id, hourlog: updatedHourlog}))

            return { success: true }
        } catch (error) {
            return { success: false, error: error.response.data.error }
        }
    }
}

export const updateManyHourlogs = (id, update) => {
    return async dispatch => {
        await hourlogService.updateMany(id, update)
        dispatch(changeMany({id: id, update: update}))
    }
}

export const deleteHourlog = (id) => {
    return async dispatch => {
        try {
            await hourlogService.deleteHourlog(id)
            dispatch(removeHourlog(id))

            return { success: true }
        } catch (error) {
            return { success: false, error: error.response.data.error }
        }
    }
}

export default hourlogSlice.reducer