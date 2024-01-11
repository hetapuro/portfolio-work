import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createHourlog } from '../../reducers/hourlogReducer'
import { ErrorHandler } from '../helpers'
import WorkHourTabs from '../Tabs/WorkHourTabs'
import useAuth from '../../hooks/useAuth.js'

const Project = ({project}) => {
    return (
      <option value={project.id}>{project.name}</option>
    )
  }

const WorkHours = ({start_h, start_min, end_h, end_min, break_min}) => {
    // Lets convert times into minutes
    const startTime = parseInt(start_h * 60) + parseInt(start_min)
    const endTime = parseInt(end_h * 60) + parseInt(end_min)
    const workTime = endTime - startTime - break_min

    const hours = Math.floor(workTime / 60)
    const minutes = workTime % 60

    return `${hours}h ${minutes}min`
}

const NewHourLog = () => {
  const { userId, isAdmin } = useAuth()
  const projects = useSelector(state => state.projects.personal.filter(project => project.members.some(member => member.user === userId && (member.status === 1 || member.status ===  2))))
  const [newEntry, setNewEntry] = useState({start_h: 8, start_min: 0, end_h: 16, end_min: 0, break_min: 0, work_date: new Date()})
  const [id, setID] = useState(projects.length > 0 ? projects[0].id : "")
  const dispatch = useDispatch()
  
  const currentDate = new Date()
  const maxDate = currentDate.toISOString().slice(0, 10)
  const minDate = new Date(currentDate.getTime() - 7*24*60*60*1000).toISOString().slice(0, 10)
  
  const addEntry = async (event) => {
      event.preventDefault()
      //console.log('button clicked', event.target)

      const newHourlog = {
        ...newEntry,
        project: id
      }
  
      dispatch(createHourlog(newHourlog))
        .then((response) => {
            if (response.success === true) {
                window.alert('Hourlog saved!')
          
                setNewEntry({start_h: 8, start_min: 0, end_h: 16, end_min: 0, break_min: 0, work_date: new Date(), description: ""})
            } else {
                ErrorHandler(response.error)
            }
        })
    }

  const handleProjectChange = (event) => {
      //console.log(event.target.value)
      setID(event.target.value)
  }

  const handleInputChange = (event) => {
      //console.log(event.target.value)
      setNewEntry(prevState => ({
        ...prevState,
        [event.target.name]: event.target.value
      }))
  }

  const handleDateChange = (event) => {
      setNewEntry(prevState => ({
          ...prevState,
          work_date: new Date(event.target.value)
      }))
  }

  return (
      <div className='contentWrapper'>
        <div className='left-side-container'>
          <WorkHourTabs />
          <div className='container'>
            <h2>New Entry</h2>
            <form className='row g-3' onSubmit={addEntry}>

            <div className='col-md-8'>
              <label className='form-label'>Project</label>
              <select className='form-select' onChange={handleProjectChange}>
                  {projects.map(project => 
                      <Project key={project.id} project={project}/>
                  )}
              </select>
            </div>
            <div className='entry'>
              <div className='column-group'>
                <label className='form-label entry-label'>Start time</label>
                <span className='timefield'>
                  <input className='form-control time-input' type='number' name='start_h' value={newEntry.start_h} min={0} max={23} onChange={handleInputChange} required/>
                  <input className='form-control time-input' type='number' name='start_min' value={newEntry.start_min} min={0} max={45} step={15} onChange={handleInputChange} required/> 
                </span>
                <label className='form-label entry-label'>End time</label>
                <span className='timefield'>
                  <input className='form-control time-input' type='number' name='end_h' value={newEntry.end_h} min={newEntry.start_h} max={23} onChange={handleInputChange} required/>
                  <input className='form-control time-input' type='number' name='end_min' value={newEntry.end_min} min={0} max={45} step={15} onChange={handleInputChange} required/> 
                </span>
                <label className='form-label entry-label'>Break (min)</label> 
                <input className='form-control time-input' type='number' name='break_min' value={newEntry.break_min} min={0} step={15} onChange={handleInputChange} required/>
              </div>

              <div className='column-group'>
                <label className='form-label entry-label'>Date</label>
                <input className='form-control' type='date' name='work_date' value={newEntry.work_date ? newEntry.work_date.toISOString().slice(0, 10) : maxDate} onChange={handleDateChange} required={true} max={maxDate} min={minDate}/>
                <label className='form-label entry-label'>Description</label>
                <textarea className='form-control' rows='4' type='textarea' placeholder='Short description of your work' name='description' maxLength={450} value={newEntry.description} onChange={handleInputChange} required={true}/>
              </div>
            </div>

            <label className='form-label'>Time worked</label>
            <p><WorkHours start_h={newEntry.start_h} start_min={newEntry.start_min} end_h={newEntry.end_h} end_min={newEntry.end_min} break_min={newEntry.break_min}/></p>

            <div className='col-md-12'>
              <button className='btn btn-primary' type='submit'>Send</button>
            </div>

            </form>
          </div>
        </div>
      </div>
  )
}

export default NewHourLog