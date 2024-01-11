import { createSlice } from '@reduxjs/toolkit'
import projectService from '../services/projects'

const projectSlice = createSlice({
    name: 'projects',
    initialState: {all: [], personal: []},
    reducers: {
        changeProject(state, action) {
            const {id, project} = action.payload

            const updatedState = {
                ...state,
                all: state.all.map(p => p.id !== id ? p : {...p, ...project}),
                personal: state.personal.map(p => p.id !== id ? p : {...p, ...project})
            }

            return updatedState
        },
        removeProject(state, action) {
            const id = action.payload

            const updatedState = {
                ...state, 
                all: state.all.filter(p => p.id !== id),
                personal: state.personal.filter(p => p.id !== id)
            }

            return updatedState
        },
        appendProject(state, action) {
            state.personal.push(action.payload)
        },
        setProjects(state, action) {
            const {id, projects} = action.payload //change this to username rather than id maybe?

            const initialState = {
                all: projects,
                personal: projects.filter(p => p.members.some(member => member.user === id))
            }

            return initialState
        }
    }
})

export const { changeProject, removeProject, appendProject, setProjects } = projectSlice.actions

export const initializeProjects = (id) => {
    return async dispatch => {
        const projects = await projectService.getAll()
        console.log(projects)
        dispatch(setProjects({id: id, projects: projects}))
    }
}

export const createProject = project => {
    return async dispatch => {
        const response = await projectService.create(project)
        dispatch(appendProject(response.newProject))

        return response
    }
}

export const updateProject = (id, project) => {
    return async dispatch => {
        try {
            const updatedProject = await projectService.update(id, project);
            dispatch(changeProject({ id: id, project: updatedProject }));
      
            return { success: true, data: updatedProject };
        } catch (error) {
            // Handle error here, you can log or notify about the failure
            console.error('Update project failed:', error);
      
            return { success: false, error: error.response.data.error };
        }
    }
}

export default projectSlice.reducer