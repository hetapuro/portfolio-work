import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeProject, updateProject } from '../../reducers/projectReducer'
import { createNotif } from '../../reducers/notifReducer'
import ProjectTabs from '../Tabs/ProjectTabs.js'
import {UpdateMember, WorkHourCalculator, GetType, ErrorHandler} from '../helpers.js'
import transactions from '../../services/transactions'
import useAuth from '../../hooks/useAuth'

const Project = ({project}) => {
  return (
    <option value={project.id}>{project.name}</option>
  )
}

const EditView = ({project, handleUpdate, onClose}) => {
  const [updatedProject, setUpdatedProject] = useState(project)
  const configs = useSelector(state => state.configs)

  // Handles input change in every input field
  const handleInputChange = (event) => {
    //console.log(event.target.value)
    setUpdatedProject(prevState => ({
      ...prevState,
      [event.target.name]: event.target.value
    }))
  }

  const handleArrayChange = (event) => {
    const checkboxValue = event.target.value
    const projectTags = updatedProject.tags
    //console.log(projectTags)

    if (projectTags.includes(checkboxValue)) {
      setUpdatedProject(prevState => ({
        ...prevState,
        tags: prevState.tags.filter(tag => tag !== checkboxValue)
      }))
    }
    else {
      setUpdatedProject(prevState => ({
        ...prevState,
        tags: [...prevState.tags, checkboxValue]
      }))
    }
  }

  const handleToggle = () => {
    setUpdatedProject(prevState => ({
      ...prevState,
      open: !prevState.open
    }))
  }

  const handleRoleChange = (event, id) => {
    const updatedMembers = UpdateMember({project: updatedProject, memberID: id, update: {[event.target.name]: event.target.value}})

    setUpdatedProject({...updatedProject, members: updatedMembers})
    //console.log(updatedProject)
  }
  
  return (
    <div className='right-side-container'>
      <div className='container'>
        <span className='close-button' onClick={() => onClose()}>X</span>
        <h2 className='right-side-title'>Update Project</h2>
        <form onSubmit={(event) => handleUpdate(event, updatedProject)}>
          <label className='form-label'>Edit project name</label>
          <input className='form-control' name='name' value={updatedProject.name} onChange={handleInputChange} type='text' required minLength={2}/>
          <label className='form-label'>Change project type</label>
          <select className='form-select' name='type' value={updatedProject.type} onChange={handleInputChange}>
            <option value={1}>Project</option>
            <option value={2}>Practical Training</option>
            <option value={3}>Other</option>
          </select>
          <label className='form-label'>Change owner</label>
          <select className='form-select' name='owner' value={updatedProject.owner} onChange={handleInputChange}>
            {updatedProject.members.map(member => 
              <option value={member.user}>{member.name}</option>)}
          </select>
          <label className='form-label'>Change client</label>
          <select className='form-select' name='client' value={updatedProject.client} onChange={handleInputChange}>
            {configs[0].clients.map(client => 
              <option value={client}>{client}</option>)}
          </select>
          <label className='form-label'>Anyone can join</label>
          <div className='form-check form-switch'>
            <input className='form-check-input' type='checkbox' role='switch' onChange={handleToggle} checked={updatedProject.open}/>
          </div>
          <label className='form-label'>Edit tags</label>
          <div className='container tag-container'>
            {configs[0].tags.map((tag) =>
              <><input className='btn-check' id={tag} type='checkbox' value={tag} checked={updatedProject.tags.includes(tag)} onChange={handleArrayChange}/>
              <label className='btn btn-outline-primary' for={tag}>{tag}</label></>)}<br/>
          </div>
          <label className='form-label'>Edit team's roles</label>
          <ul>
            {updatedProject.members.map(member => {
              return (
                <li>{member.name}
                  <select className='form-select' name='role' value={member.role} onChange={(event) => handleRoleChange(event, member.user)}>
                    {configs[0].roles.map(role => 
                      <option value={role}>{role}</option>
                    )}
                  </select>
                </li>
              )
            })}
          </ul>
          <label className='form-label'>Edit description</label>
          <textarea className='form-control' rows={3} name='description' value={updatedProject.description} onChange={handleInputChange} required maxLength={450}/>
          <span className='form-text'>Maximum of 450 characters</span><br/>
          <label className='form-label'>Edit portfolio link</label>
          <input  className='form-control' name='portfolio' value={updatedProject.portfolio} onChange={handleInputChange} type='url'/>
          <button className='btn btn-primary' type='submit'>Save</button>
        </form>
      </div>
    </div>
  )
}

const EditPortfolio = ({project, memberID, handlePortfolioChange, onClose}) => {
  const member = project.members.find(member => member.user === memberID)
  const [portfolioLink, setPortfolioLink] = useState(member.portfolio)

  return (
    <div className='right-side-container'>
      <div className='container'>
      <span className='close-button' onClick={() => onClose()}>X</span>
        <h2 className='right-side-title'>Update Portfolio Link</h2>
        <form onSubmit={(event) => handlePortfolioChange(event, portfolioLink)}>
          <label className='form-label'>Edit portfolio link</label>
          <input  className='form-control' name='portfolio' value={portfolioLink} onChange={(event) => setPortfolioLink(event.target.value)} type='url'/>
          <button className='btn btn-primary' type='submit'>Save</button>
        </form>
      </div>
    </div>
  )
}

const MemberList = ({member, onRemoveMember}) => {
  const { userId, isAdmin  } = useAuth()

  if (member.user === userId)
    return <li>{member.name}</li>

  return (
    <li>
      {member.name}
      <button className='btn btn-primary' style={{marginLeft: '10px'}} type='button' onClick={() => onRemoveMember(member.user)}>-</button>
    </li>
  )
}

const AddMembers = ({project, handleAddMember, onClose, closeAddMembers}) => {
  const students = useSelector(state => state.users.filter(user => user.usertype === 3))
  const [members, setMembers] = useState([])
  const [newMember, setNewMember] = useState({user: '0'})

  const addMembers = (event) => {
    members.forEach(member => {
        const notif = {
          to_user: member.user,
          message: `You have been requested to join in '${project.name}'`,
          message_type: 7,
          project: project.id
        }

        handleAddMember(event, notif)
    })
    closeAddMembers()
  }
  
  const handleAddNewMember = () => {
    if (!project.members.some(member => member.user === newMember.user)) {
      setMembers(prevState => ([
        ...prevState,
        newMember
      ]))
    }
    setNewMember({user: '0', name: ''})
  }
  
  const handleDeleteMember = (id) => {
    setMembers(members.filter(member => member.user !== id))
  }
  
    const handleNewMemberChange = (event) => {
      const selectedMember = students.find(student => student.id === event.target.value)
  
      if (selectedMember) {
        setNewMember({
          user: selectedMember.id,
          name: selectedMember.name
        })
      }
    }

  return (
    <div className='right-side-container'>
      <div className='container'>
        <span className='close-button' onClick={() => onClose()}>X</span>
        <h2 className='right-side-title'>Add Members</h2>
        <form className='row g-3' onSubmit={addMembers}>
          <label className='form-label'>Add member</label><br/>
              <div className='col-8'>
                <select className='form-select' value={newMember.user} onChange={handleNewMemberChange}>
                  <option value={'0'}></option>
                  {students.map(student => (
                    <option value={student.id}>{student.name}</option>))}
                </select>
              </div>
              <div className='col-auto'>
                <button className='btn btn-primary' style={{margin: 0}} type='button' onClick={handleAddNewMember}>+</button>
              </div>
          <label className='form-label'>Members to add</label>
          <ul>
            {members.map(member => 
              <MemberList member={member} onRemoveMember={handleDeleteMember}/>
            )}
          </ul>
          <div className='col-auto'>
            <button className='btn btn-primary' type='submit'>Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditProjects = () => {
  const { userId } = useAuth()
  const projects = useSelector(state => state.projects.personal).filter(project => project.members.some(member => member.user === userId && member.status < 4))
  const hourlogs = useSelector(state => state.hourlogs.filter(hourlog => hourlog.status !== 4))
  const [id, setID] = useState(projects.length > 0 ? projects[0].id : '')
  const [selectedProject, setSelectedProject] = useState(projects.length > 0 ? {...projects[0], owner: projects[0].owner.id} : {})
  const [isEditing, setIsEditing] = useState(false)
  const [addingMembers, setAddingMembers] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    //console.log('setting')
    setSelectedProject(projects.length > 0 ? {...projects[0], owner: projects[0].owner.id} : {})
  }, [])

  const editProject = async (event, updatedProject) => {
    event.preventDefault()
    //console.log('button clicked', event.target)

    if (updatedProject.owner !== selectedProject.owner) {
      const notif = {
        to_user: updatedProject.owner,
        message: `You have been assigned as the owner of ${updatedProject.name}`,
        message_type: 3
      }

      await transactions.changeOwner(id, {notif: notif, updatedProject: updatedProject})
      .then(() => {
        dispatch(changeProject({id: id, project: updatedProject}))
        window.alert('Project updated!')
        setIsEditing(false)
        setSelectedProject({...selectedProject, ...updatedProject})
      })
      .catch((error) => ErrorHandler(error.response.data.error))
    }
    else {
      dispatch(updateProject(id, updatedProject))
        .then((response) => {
          //console.log(response)
    
          if (response.success === true) {
            window.alert('Project updated!')
            setIsEditing(false)
            setSelectedProject({...selectedProject, ...updatedProject})
          } else {
            ErrorHandler(response.error)
          }
        })

    } 
  }

  const updatePortfolio = async (event, portfolioLink) => {
    event.preventDefault()

    const updatedMembers = UpdateMember({project: selectedProject, memberID: userId, update: {portfolio: portfolioLink}})

    const updatedProject = {
      members: updatedMembers
    }

    dispatch(updateProject(id, updatedProject))

    setIsEditing(false)
    setSelectedProject({...selectedProject, ...updatedProject})
  }

  const addMembers = (event, notif) => {
    event.preventDefault()
    
    dispatch(createNotif(notif))
  }


  // Handler-functions (handle changes in input fields)
  const handleProjectChange = (event) => {
    //console.log(projects.length > 0)
    const selected = projects.find(project => project.id === event.target.value)

    setID(event.target.value)
    setSelectedProject({...selected, owner: selected.owner.id})
  }
  
  if (projects.length > 0) {
    return (
      <div className='contentWrapper'>
        <div className='left-side-container'>
          <ProjectTabs />
          <div className='container'>
            <h2>Your Projects</h2>
            <div className='row g-3'>
              <div className='col-md-6'>
                <label className='form-label'>Project</label>
                <select className='form-select' onChange={handleProjectChange}>
                  {projects.map(project => 
                    <Project key={project.id} project={project}/>
                    )}
                </select>
              </div>
              <div className='col-md-6'>
                <label className='form-label'>Type</label><br/>
                {GetType(selectedProject.type)}
              </div>

              <div className='col-md-6'>
                <label className='form-label'>Client</label>
                <p>{selectedProject.client}</p>
              </div>

              <div className='col-md-12'>
                <label className='form-label'>Tags</label><br/>
                {selectedProject.tags.map((tag) =>
                  <><input className='btn-check' id={tag} type='checkbox' value={tag} checked/>
                  <label className='btn btn-outline-primary no-hover' for={tag}>{tag}</label></>)}
              </div>

              <div className='col-md-12'>
                <label className='form-label'>Description</label>
                <p>{selectedProject.description}</p>
              </div>

              <div className='col-md-12'>
                <label className='form-label'>Current team</label>
                <ul>
                  {selectedProject.members.map(member => {
                    if (member.status !== 4) {
                      return <li>{member.name} <b>{member.role}</b></li>
                    }
                  })}
                </ul>
              </div>

              <div className='col-md-12'>
                <label className='form-label'>Past members</label>
                <ul>
                  {selectedProject.members.map(member => {
                    if (member.status === 4) {
                      return <li>{member.name} <b>{member.role}</b></li>
                    }
                  })}
                </ul>
              </div>

              <div className='col-md-12'>
                <label className='form-label'>Total work hours</label><br/>
                <WorkHourCalculator hourlogs={hourlogs.filter(hourlog => hourlog.project.id === id)} logStatus={0}/>
              </div>

              <div className='col-auto'>
                <button className='btn btn-primary' type='button' onClick={() => setIsEditing(true)}>Edit</button>
              </div>
              <div className='col-auto'>
                <button className='btn btn-success' type='button' onClick={() => setAddingMembers(true)}>Add members</button>
              </div>
            </div>
          </div>
        </div>

        {(isEditing && selectedProject.owner === userId) && (
          <EditView project={selectedProject} handleUpdate={editProject} onClose={() => setIsEditing(false)}/>
        )}
        {(isEditing && selectedProject.owner !== userId) && (
          <EditPortfolio project={selectedProject} memberID={userId} handlePortfolioChange={updatePortfolio} onClose={() => setIsEditing(false)}/>
        )}
        {addingMembers && (
          <AddMembers project={selectedProject} handleAddMember={addMembers} onClose={() => setAddingMembers(false)} closeAddMembers={() => setAddingMembers(false)}/>
        )}
      </div>  
    )
  }
  else {
    return(
      <div className='contentWrapper'>
        <div className='left-side-container'>
          <ProjectTabs />
          <div className='container'>
            <p>You have no projects</p>
          </div>
        </div>
    </div>)
  }
}

export default EditProjects