import { useDispatch, useSelector } from 'react-redux'
import ProjectTabs from "../Tabs/ProjectTabs"
import { ErrorHandler, ProjectInfo, ProjectTable, UserInfo } from '../helpers'
import { useState } from 'react'
import { changeProject } from '../../reducers/projectReducer'
import transactions from '../../services/transactions'
import useAuth from '../../hooks/useAuth'

const JoinProject = ({project, handleAddMember, onClose}) => {
    const { userId, isAdmin } = useAuth()
    const user = useSelector(state => state.users.find(user => user.id === userId))
    const configs = useSelector(state => state.configs)
    const [member, setMember] = useState({user: userId, name: user.name, status: 1})

    const handleInputChange = (event) => {
        setMember(prevState => ({
            ...prevState,
            [event.target.name]: event.target.value
        }))
    }

    return (
        <div className='container'>
            <span className='close-button' onClick={() => onClose()}>X</span>
            <h2 className='right-side-title'>Join Project</h2>
            <label className='form-label'>Project name</label>
            <p>{project.name}</p>
            <label className='form-label'>Project leader</label>
            <p>{project.owner.name}</p>
            <label className='form-label'>Current team</label>
            <ul>
                {project.members.map(member => {
                    if (member.status !== 4) {
                        return <li>{member.name} <b>{member.role}</b></li>
                    }
                })}
            </ul>
            <form onSubmit={(event) => handleAddMember(event, member)}>
                <label className='form-label'>Your portfolio link</label>
                <input className='form-control' name='portfolio' value={member.portfolio} type='url' onChange={handleInputChange}/>
                <label className='form-label'>Your role</label>
                <select className='form-select' name='role' value={member.role} onChange={handleInputChange}>
                    {configs[0].roles.map(role => 
                      <option value={role}>{role}</option>
                    )}
                  </select>
                <button className='btn btn-primary' type='submit'>Join</button>
            </form>
        </div>
    )
}

const AllProjects = () => {
    const projects = useSelector(state => state.projects.all)
    const { id } = useAuth()
    const [selectedProject, setSelectedProject] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [joiningProject, setJoiningProject] = useState(false)
    const dispatch = useDispatch()

    const addMember = async (event, member) => {
        event.preventDefault()

        if (!selectedProject.members.some(member => member.user === id)) {
    
            const notif = {
                to_user: selectedProject.owner.id,
                message: `I joined your project ${selectedProject.name}`,
                message_type: 3
            }
            
            await transactions.joinOpenProject(selectedProject.id, {notif: notif, member: member})
                .then((updatedProject) => {
                    dispatch(changeProject({id: selectedProject.id, project: updatedProject}))
                    window.alert(`You have joined ${selectedProject.name}!`)
                    setSelectedProject(null)
                    setJoiningProject(false)
                })
                .catch((error) => ErrorHandler(error.response.data.error))
        }
    }

    const handleProjectChange = (project) => {
        setSelectedProject(project)
        setSelectedUser(null)
        setJoiningProject(false)
    }

    const handleUserChange = (userID) => {
        setSelectedUser(userID)
        setSelectedProject(null)
        setJoiningProject(false)
    }

    return (
        <div className='contentWrapper'>
            <div className='left-side-container'>
                <ProjectTabs />
                <div className='container'>
                    <h2>All Projects</h2>
                    <table className='table table-striped table-hover project-table'>
                        <thead>
                            <tr>
                                <th>Project name</th>
                                <th>Owner</th>
                                <th>Members</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => 
                                <ProjectTable key={project.id} project={project} handleProjectClick={handleProjectChange} handleUserClick={handleUserChange}/>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='right-side-container'>
                {(selectedProject !== null && !joiningProject) && (
                    <ProjectInfo project={selectedProject} handleJoinProject={() => setJoiningProject(true)} onClose={() => setSelectedProject(null)}/>
                )}
                {selectedUser !== null && (
                    <UserInfo userID={selectedUser} onClose={() => setSelectedUser(null)}/>
                )}
                {joiningProject && (
                    <JoinProject project={selectedProject} handleAddMember={addMember} onClose={() => setJoiningProject(false)}/>
                )}
            </div>
        </div>
    )
}

export default AllProjects