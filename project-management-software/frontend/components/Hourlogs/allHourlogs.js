import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import WorkHourTabs from '../Tabs/WorkHourTabs'
import { ErrorHandler, LogTable } from '../helpers'
import { updateHourlog, removeHourlog, deleteHourlog } from '../../reducers/hourlogReducer'
import { appendTeacherEvent } from '../../reducers/teacherEventReducer'
import transactions from '../../services/transactions'
import useAuth from '../../hooks/useAuth.js'

const AllHourLogs = () => {
    const { userId, isAdmin } = useAuth()
    
    const hourlogs = useSelector(state => {
        if (isAdmin) {
            return state.hourlogs
        } else {
            return state.hourlogs.filter(hourlog => hourlog.creator.id === userId && hourlog.status !== 4)
        }
    })
    const sortedHourlogs = [...hourlogs].sort((a, b) => {
        const dateA = new Date(a.work_date)
        const dateB = new Date(b.work_date)

        return dateB - dateA
    })
    const [selectedHourlog, setSelectedHourlog] = useState(null)
    const [project, setProject] = useState("")
    const dispatch = useDispatch()

    const currentDate = new Date()
    const maxDate = currentDate.toISOString().slice(0, 10)
    const minDate = new Date(currentDate.getTime() - 7*24*60*60*1000).toISOString().slice(0, 10)

    const editHourlog = (event) => {
        event.preventDefault()

        dispatch(updateHourlog(selectedHourlog.id, selectedHourlog))
            .then((response) => {
                if (response.success === true) {
                    window.alert('Hourlog updated!')
                    setSelectedHourlog(null)
                    setProject("")
                } else {
                    ErrorHandler(response.error)
                }
            })
    }

    const deleteSelectedHourlog = (event, hourlog) => {
        event.preventDefault()

        if (window.confirm('Do you want to delete a hourlog?')) {
            dispatch(deleteHourlog(hourlog.id))
                .then((response) => {
                    if (response.success === true) {
                        window.alert('Hourlog deleted')
                    } else {
                        ErrorHandler(response.error)
                    }
                })
        }
    }

    const adminDeleteHourlog = async (event, hourlog) => {
        event.preventDefault()

        if (window.confirm('Do you want to delete a hourlog?')) {
            const notif = {
                to_user: hourlog.creator.id,
                message: `One of your reported hourlogs was deleted.`,
                message_type: 2
            }
    
            await transactions.deleteHourlog(hourlog.id, {notif: notif})
                .then((response) => {
                    dispatch(removeHourlog(hourlog.id))
                    dispatch(appendTeacherEvent(response.teacherEvent))
                    window.alert('Hourlog deleted')
                })
                .catch((error) => ErrorHandler(error.response.data.error))
        }

    }

    const handleEditClick = (hourlog) => {
        const [start_h, start_min] = hourlog.start_time.split(':')
        const [end_h, end_min] = hourlog.end_time.split(':')
        const [break_h, break_min] = hourlog.break_time.split(':')

        const break_time = parseInt(break_h * 60) + parseInt(break_min)
        
        setProject(hourlog.project.name)
        setSelectedHourlog({
            ...hourlog,
            start_h: start_h,
            start_min: start_min,
            end_h: end_h,
            end_min: end_min,
            break_min: break_time,
            work_date: new Date(hourlog.work_date)
        })
    }

    const handleInputChange = (event) => {
        //console.log(event.target.value)
        setSelectedHourlog(prevState => ({
          ...prevState,
          [event.target.name]: event.target.value
        }))
    }
  
    const handleDateChange = (event) => {
        setSelectedHourlog(prevState => ({
            ...prevState,
            work_date: new Date(event.target.value)
        }))
    }

    if (isAdmin) {
        return (
            <div className='contentWrapper'>
                <div className='left-side-container'>
                    <WorkHourTabs />
                    <div className='container'>
                        <h2>All Entries</h2>
                        <table className='table table-striped hour-report-table'>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Project name</th>
                                    <th>Date</th>
                                    <th>Duration</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedHourlogs.map(hourlog => 
                                    <LogTable hourlog={hourlog} onDelete={adminDeleteHourlog}/>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    return (
    <div className='contentWrapper'>
        <div className='left-side-container'>
            <WorkHourTabs />
            <div className='container'>
                <h2>All Entries</h2>
                <table className='table table-striped hour-report-table'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Project name</th>
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedHourlogs.map(hourlog => 
                            <LogTable hourlog={hourlog} onEdit={handleEditClick}/>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        <div className='right-side-container'>
            {selectedHourlog !== null && (
                <div className='container'>
                    <span className='close-button' onClick={() => setSelectedHourlog(null)}>X</span>
                    <h2 className='right-side-title'>Update Log Entry</h2>
                    <form className='row g-3' onSubmit={editHourlog}>
                        <div className='col-md-12'>
                            <label className='form-label'>Project</label>
                            <p>{project}</p>
                        </div>
                        <div className='col-md-12'>
                            <label className='form-label'>Date</label>
                            <input className='form-control' type='date' name='work_date' value={selectedHourlog.work_date ? selectedHourlog.work_date.toISOString().slice(0, 10) : maxDate} onChange={handleDateChange} required max={maxDate} min={minDate}/>
                        </div>
                        <div className='col-md-12'>
                            <label className='form-label'>Start time</label>
                            <span className='timefield'>
                                <input className='form-control time-input' type='number' name='start_h' value={selectedHourlog.start_h} min={0} max={23} onChange={handleInputChange} required/>
                                <input className='form-control time-input' type='number' name='start_min' value={selectedHourlog.start_min} min={0} max={45} step={15} onChange={handleInputChange} required/> 
                            </span>
                        </div>
                        <div className='col-md-12'>
                            <label className='form-label'>End time</label>
                            <span className='timefield'>
                                <input className='form-control time-input' type='number' name='end_h' value={selectedHourlog.end_h} min={selectedHourlog.start_h} max={23} onChange={handleInputChange} required/>
                                <input className='form-control time-input' type='number' name='end_min' value={selectedHourlog.end_min} min={0} max={45} step={15} onChange={handleInputChange} required/> 
                            </span>
                        </div>
                        <div className='col-md-12'>
                            <label className='form-label'>Break</label>
                            <input className='form-control time-input' type='number' name='break_min' value={selectedHourlog.break_min} min={0} step={15} onChange={handleInputChange} required/>
                        </div>
                        <div className='col-md-12'>
                            <label className='form-label'>Description</label>
                            <textarea className='form-control' rows='4' type='textarea' placeholder='Short description of your work' name='description' maxLength={450} value={selectedHourlog.description} onChange={handleInputChange} required/>
                        </div>
                        <div className='row justify-content-between'>
                            <div className='col-auto'>
                                <button className='btn btn-primary' type='submit'>Update</button>
                            </div>
                            <div className='col-auto'>
                                <button className='btn btn-danger' type='button' onClick={event => deleteSelectedHourlog(event, selectedHourlog)}>Delete</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    </div>
    )

}

export default AllHourLogs