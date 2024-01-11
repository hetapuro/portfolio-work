import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeNotif, createNotif, updateNotif } from '../reducers/notifReducer'
import { changeProject } from '../reducers/projectReducer'
import { DateFormatConverter, ErrorHandler } from './helpers'
import transactions from '../services/transactions'
import useAuth from '../hooks/useAuth.js'

const NotificationContainer = ({notif}) => {
    let messageClass = ''

    switch (notif.message_type) {
        case 1: 
            messageClass = 'notif-element positive-msg'
            break
        case 2:
            messageClass = 'notif-element negative-msg'
            break
        default:
            messageClass = 'notif-element neutral-msg'
            break
    }

    return (
        <div className={messageClass}>
            <i>{DateFormatConverter(notif.date_created)}</i>
            <p className='sender'>{notif.from_user.name}</p>
            <p className='notif-message'>{notif.message}</p>
        </div>
    )
}

const JoinProject = ({notif, handleApproval, handleRejection}) => {
    const configs = useSelector(state => state.configs)
    const { userId, isAdmin } = useAuth()
    const user = useSelector(state => state.users.find(user => user.id === userId))
    const [newMember, setNewMember] = useState({user: userId, name: user.name, role: configs[0].roles[0], status: 1})
    const [joinProject, setJoinProject] = useState(false)

    const handleInputChange = (event) => {
        setNewMember({...newMember, [event.target.name]: event.target.value})
    }
    
    return (
        <div className='notif-element neutral-msg'>
            <i>{DateFormatConverter(notif.date_created)}</i>
            <p className='sender'>{notif.from_user.name}</p>
            <p className='notif-message'>{notif.message}</p>
            {!joinProject && (
                <>
                    <button className='btn btn-success' onClick={() => setJoinProject(true)} type='button'>Accept</button>
                    <button className='btn btn-danger' onClick={(event) => handleRejection(event, notif)} type='button'>Decline</button>
                </>
            )}
            {joinProject && (
                <form onSubmit={(event) => handleApproval(event, notif, newMember)}>
                    <p className='sender'>Set portfolio link & role</p>
                    <p className='sender'>Portfolio link</p>
                    <input className='form-control' name='portfolio' value={newMember.portfolio} type='url' onChange={handleInputChange}/>
                    <p className='sender'>Role</p>
                    <select className='form-select' name='role' value={newMember.role} onChange={handleInputChange}>
                        {configs[0].roles.map(role =>
                            <option value={role}>{role}</option>
                        )}
                    </select>
                    <button className='btn btn-success' type='Submit'>Join</button>
                    <button className='btn btn-danger' type='button' onClick={() => setJoinProject(false)}>Cancel</button>
                </form>
            )}
        </div>
    )
}

const NotificationBox = () => {
    const notifications = useSelector(state => state.notifs.filter(notif => notif.is_read === false && (notif.message_type < 4 || notif.message_type === 7)))
    const projects = useSelector(state => state.projects.all)
    const [openNotifications, setOpenNotifications] = useState(false)
    const dispatch = useDispatch()

    const acceptApplication = async (event, notif, newMember) => {
        event.preventDefault()
        const project = projects.filter(project => project.id === notif.project.id)

        const acceptNotif = {
            to_user: notif.from_user.id,
            message: `I joined ${notif.project.name}!`,
            message_type: 1,
            project: notif.project.id
        }

        await transactions.joinProject(project[0].id, notif.id, {notif: acceptNotif, member: newMember, updatedNotif: {is_read: true}})
        .then((updatedProject) => {
            dispatch(changeNotif({id: notif.id, notif: {is_read: true}}))
            dispatch(changeProject({id: project[0].id, project: updatedProject}))
        })
        .catch((error) => ErrorHandler(error.response.data.error))
    }

    const rejectApplication = (event, notif) => {
        event.preventDefault()

        const rejectNotif = {
            to_user: notif.from_user.id,
            message: `I didn't join ${notif.project.name}`,
            message_type: 2,
            project: notif.project.id
        }

        dispatch(updateNotif(notif.id, {is_read: true}))
        dispatch(createNotif(rejectNotif))
    }

    const handleNotificationOpen = () => {
        if (!openNotifications)
            setOpenNotifications(true)
        else {
            setOpenNotifications(false)
            notifications.forEach(notif => {
                if (notif.message_type !== 7)
                    dispatch(updateNotif(notif.id, {is_read: true}))
            })
        }
    }
    
    return (
        <div className='notifications'>
            <div className='notifications-top' onClick={handleNotificationOpen}>
                <span className='dot'>
                    <p>{notifications.length}</p>
                </span>
                <p>Notifications</p>
                <i className='arrow down'></i>
            </div>
            {openNotifications && (
                <div className='notifications-container'>
                    {notifications.map(notif => {
                        if (notif.message_type !== 7) {
                            return <NotificationContainer notif={notif}/>
                        }
                        else {
                            return <JoinProject notif={notif} handleApproval={acceptApplication} handleRejection={rejectApplication}/>
                        }
                    })}
                </div>
            )}
        </div>
    )
}

export default NotificationBox