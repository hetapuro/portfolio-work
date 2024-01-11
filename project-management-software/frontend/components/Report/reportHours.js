import {useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeProject } from '../../reducers/projectReducer'
import { changeMany } from '../../reducers/hourlogReducer'
import { deleteHourlog } from '../../reducers/hourlogReducer'
import ReportTabs from '../Tabs/ReportTabs'
import { ErrorHandler, WorkHourCalculator } from '../helpers'
import { LogTable } from '../helpers'
import transactions from '../../services/transactions'
import useAuth from '../../hooks/useAuth.js'

const Project = ({project}) => {
    return (
        <option value={project.id}>{project.name}</option>
    )
}

const ReportProjects = () => {
    const { userId, isAdmin } = useAuth()
    const hourlogs = useSelector(state => state.hourlogs)
    const reportProjects = useSelector(state => state.projects.personal.filter(project => {
        if (project.members.some(member => member.status === 1 && member.user === userId) && project.type === 1 && hourlogs.some(hourlog => hourlog.project.id === project.id && hourlog.status === 1))
            return project
    }))
    const [selectedProject, setSelectedProject] = useState(reportProjects.length > 0 ? reportProjects[0] : {})
    const [selectedHourlogs, setSelectedHourlogs] = useState(reportProjects.length > 0 ? hourlogs.filter(hourlog => hourlog.project.id === reportProjects[0].id && hourlog.creator.id === userId) : [])
    const [message, setMessage] = useState("")
    const [reportHours, setReportHours] = useState(reportProjects.length > 0 ? hourlogs.filter(hourlog => hourlog.project.id === reportProjects[0].id && hourlog.creator.id === userId && hourlog.status === 1) : [])
    const [hourTable, setHourTable] = useState(false)
    const [id, setID] = useState(reportProjects.length > 0 ? reportProjects[0].id : "")
    
    const dispatch = useDispatch()

    const addReport = async (event) => {
        event.preventDefault()
        
        const newReport = {
            message: message,
            message_type: 4,
            project: id
        }

        const updatedHourlog = {
            prevStatus: 1,
            status: 2
        }

        await transactions.report(id, {notif: newReport, hourlog: updatedHourlog})
            .then((updatedProject) => {
                dispatch(changeMany({id: id, update: updatedHourlog}))
                dispatch(changeProject({id: id, project: updatedProject}))
                window.alert('Your report has been sent!')
                setMessage("")
                setSelectedProject(reportProjects.length > 0 ? reportProjects[0] : {})
                setID(reportProjects.length > 0 ? reportProjects[0].id : "")
            })
            .catch((error) => ErrorHandler(error.response.data.error))
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

    const handleProjectChange = (event) => {
        //console.log(event.target.value)
        const selected = reportProjects.find(project => project.id === event.target.value)
        setID(event.target.value)
        setSelectedProject(prevState => ({
            ...prevState,
            name: selected.name,
            description: selected.description,
        }))
        setSelectedHourlogs(hourlogs.filter(hourlog => hourlog.project.id === event.target.value && hourlog.creator.id === event.target.value))
        setReportHours(hourlogs.filter(hourlog => hourlog.project.id === event.target.value && hourlog.creator.id === event.target.value && hourlog.status === 1))
    }

    const handleMessageChange = (event) => {
        //console.log(event.target.value)
        setMessage(event.target.value)
    }

    const viewHours = () => {
        setHourTable(true)
    }

    if (reportProjects.length > 0 ){
        return (
            <div className='contentWrapper'>
                <div className='left-side-container'>
                    <ReportTabs />
                    <div className='container'>
                        <h2>Send Report</h2>
                        <form className='row g-3' onSubmit={addReport}>
                            <div className='col-md-8'>
                                <label className='form-label'>Select a project</label>
                                <select className='form-select' name='project' onChange={handleProjectChange}>
                                {reportProjects.map(project => 
                                    <Project key={project.id} project={project}/>
                                )}
                                </select>
                            </div>
                            
                            <div className='col-md-6'>
                                <label className='form-label'>Description</label>
                                <p>{selectedProject.description}</p>
                            </div>
                            <div className='col-md-6'>
                                <label className='form-label'>Portfolio</label>
                                <a>{selectedProject.portfolio}</a>
                            </div>

                            <div className='col-md-6'>
                                <label className='form-label'>Unreported hours</label><br/>
                                <WorkHourCalculator hourlogs={selectedHourlogs} logStatus={1}/>
                            </div>
                            <div className='col-md-6'>
                                <label className='form-label'>Total hours</label><br/>
                                <WorkHourCalculator hourlogs={selectedHourlogs} logStatus={0}/>
                            </div>

                            <div className='col-md-6'>
                                <label className='form-label'>Time till next report deadline</label>
                                <p>En jaksa</p>
                            </div>

                            <div className='col-md-12'>
                                <label className='form-label'>Notes</label>
                                <textarea className='form-control' rows={3} type='textarea' value={message} onChange={handleMessageChange} required={true} maxLength={450}/>
                            </div>

                            <div className='row justify-content-between'>
                                <div className='col-auto'>
                                    <button className='btn btn-primary' type='submit'>Report</button>
                                </div>
                                <div className='col-auto'>
                                    <button className='btn btn-primary' type='button' onClick={() => viewHours()}>Hours</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='right-side-container'>
                    {hourTable && (
                        <div className='container'>
                            <span className='close-button' onClick={() => setHourTable(false)}>X</span>
                            <h2 className='right-side-title'>Hours in report</h2>
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
                                    {reportHours.map(hourlog => 
                                        <LogTable hourlog={hourlog} onDelete={deleteSelectedHourlog}/>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
    )}
    else {
        return (
            <div className='contentWrapper'>
                <div className='left-side-container'>
                    <ReportTabs/>
                    <div className='container'>
                        <p>Nothing to report</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default ReportProjects