import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createProject } from '../../reducers/projectReducer.js'
import { createNotif } from '../../reducers/notifReducer.js'
import ProjectTabs from '../Tabs/ProjectTabs.js'
import useAuth from '../../hooks/useAuth.js'
import { ErrorHandler } from '../helpers.js'

const MemberList = ({member, onRemoveMember}) => {
  const { userId  } = useAuth()

  if (member.user === userId)
    return <li>{member.name}</li>

  return (
    <li>
      {member.name}
      <button className='btn btn-primary' style={{marginLeft: '10px'}} type='button' onClick={() => onRemoveMember(member.user)}>-</button>
    </li>
  )
}

const NewProject = () => {
  const dispatch = useDispatch()
  const configs = useSelector(state => state.configs)
  const { userId, isAdmin } = useAuth()
  const user = useSelector(state => state.users.find(user => user.id === userId))
  const students = useSelector(state => state.users.filter(student => student.usertype === 3))
  const [newProject, setNewProject] = useState({client: configs[0].clients[0], tags: [], type: 1, user: userId})
  const [members, setMembers] = useState([{user: userId, name: user.name}])
  const [newMember, setNewMember] = useState({user: '0'})
  const [portfolioLink, setPortfolioLink] = useState('')
  const [canJoin, setCanJoin] = useState(false)

  const addProject = async (event) => {
    event.preventDefault()
    //console.log('button clicked', event.target)
    //console.log(newProject)

    const response = await dispatch(createProject({...newProject, members: [{user: userId, name: user.name, portfolio: portfolioLink, status: 5, role: null}], open: canJoin}))

    console.log(response)
    if (response.success) {
      if (members.length > 1 && response.projectID) {
        members.forEach(member => {
          if (member.user !== userId) {
            const notif = {
              to_user: member.user,
              message: `You have been requested to join in '${newProject.name}'`,
              message_type: 7,
              project: response.projectID
            }
  
            dispatch(createNotif(notif))
          }
        })
      }
  
      window.alert('Your project has been submitted for review!')
  
      setNewProject({name: '', client: '', tags: [], type: 1, portfolio: '', description: '', user: userId})
      setMembers([{user: userId, name: user.name}])
      setNewMember({user: '0'})
      setPortfolioLink('')
      setCanJoin(false)
    } else {
      ErrorHandler(response.data.error)
    }
  }

  const handleAddMember = () => {
    if (!members.some(member => member.user === newMember.user)) {
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


  // Handles input change in every input field
  const handleInputChange = (event) => {
    //console.log(event.target.value)
    //console.log(members)
    setNewProject(prevState => ({
      ...prevState,
      [event.target.name]: event.target.value
    }))
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

  const handlePortfolioChange = (event) => {
    setPortfolioLink(event.target.value)
  }

  const handleArrayChange = (event) => {
    const checkboxValue = event.target.value
    const projectTags = newProject.tags

    if (projectTags.includes(checkboxValue)) {
      setNewProject(prevState => ({
        ...prevState,
        tags: prevState.tags.filter(tag => tag !== checkboxValue)
      }))
    }
    else {
      setNewProject(prevState => ({
        ...prevState,
        tags: [...prevState.tags, checkboxValue]
      }))
    }
  }

  const handleToggle = () => {
    setCanJoin(prevState => !prevState)
  }

  return (
    <div className='contentWrapper'>
      <div className='left-side-container'>
        <ProjectTabs />
        <div className='container'>
          <h2>Create New Project</h2>

          <form className='row g-3' onSubmit={addProject}>

            <div className='col-md-6'>
              <label className='form-label'>Project name</label>
              <input className='form-control' name='name'value={newProject.name} onChange={handleInputChange} type='text' required={true} minLength={2}/> 
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Project type</label>
              <select className='form-select' name='type' value={newProject.type} onChange={handleInputChange}>
                <option value={1}>Project</option>
                <option value={2}>Practical Training</option>
                <option value={3}>Other</option>
              </select>
            </div>

            <div className='col-md-6'>
              <label className='form-label'>Client</label>
              <select className='form-select' name='client' value={newProject.client} onChange={handleInputChange}>
                {configs[0].clients.map(client => 
                  <option value={client}>{client}</option>)}
              </select>
            </div>

            <div className='col-md-6'>
              <label className='form-label'>Anyone can join</label>
              <div className='form-check form-switch'>
                <input className='form-check-input' type='checkbox' role='switch' onChange={handleToggle} checked={canJoin}/>
              </div>
            </div>

            <div className='col-md-12'>
              <label className='form-label'>Team</label>
              <ul>
                {members.map(member => 
                  <MemberList member={member} onRemoveMember={handleDeleteMember}/>
                )}
              </ul>
            </div>
            
            <label className='form-label'>Add member</label><br/>
            <div className='col-4'>
              <select className='form-select' value={newMember.user} onChange={handleNewMemberChange}>
                <option value={'0'}></option>
                {students.map(student => (
                  <option value={student.id}>{student.name}</option>))}
              </select>
            </div>
            <div className='col-auto'>
              <button className='btn btn-primary' style={{margin: 0}} type='button' onClick={handleAddMember}>+</button>
            </div>

            <label className='form-label'>Tags</label>
            <div className='container tag-container'>
              {configs[0].tags.map(tag =>
                <><input className='btn-check' id={tag} type='checkbox' value={tag} checked={newProject.tags.includes(tag)} onChange={handleArrayChange}/>
                <label className='btn btn-outline-primary' for={tag}>{tag}</label></>)}
            </div>

            <div className='col-12'>
              <label className='form-label'>Description</label>
              <textarea className='form-control' rows='3' name='description' value={newProject.description} onChange={handleInputChange} type='textarea' required={true} minLength={5} maxLength={450}/>
            </div>

            <div className='col-12'>
                  <label className='form-label'>Portfolio link</label>
                  <input className='form-control' name='portfolio' value={members[0].portfolio} type='url' onChange={handlePortfolioChange}/>
            </div>

            <div className='col-12'>
              <button className='btn btn-primary' type='submit'>Create project</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default NewProject