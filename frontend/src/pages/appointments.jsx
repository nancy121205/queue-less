import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Appointments(){
    const [appointments, setAppointments] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchAppointments = () => {
            setError("")
            axios.get(
                "http://localhost:8000/appointments/my",
                {headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
            )
            .then(res => {
                setAppointments(res.data)
                setError("")
            })
            .catch((err) => setError(err.response?.data?.detail || "Failed to load doctors"))
        }
        fetchAppointments()

        const interval = setInterval(() => {
            fetchAppointments()
        }, 120000)

        return () => clearInterval(interval)
    }, [])

    const formatEstimatedTime = (isoString) => {
        if (!isoString) return "Not available"
        const date = new Date(isoString)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const formatSlotTime = (timeString) => {
        if (!timeString) return "Not available"
        const [hours, minutes] = timeString.split(":")
        const date = new Date()
        date.setHours(parseInt(hours), parseInt(minutes), 0)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    return(
        <div>   
            <h2>Appointments made</h2>
            {error && <p>{error}</p>}
            <div>
                {appointments.map(appointment => (
                    <div key={appointment.id}>
                        <h4>Appointment</h4>
                        <p>Date: {appointment.date}</p>
                        <p>Doctor: {appointment.doctor}</p>
                        <p>Hospital: {appointment.hospital}</p>
                        <p>Slot Time: {formatSlotTime(appointment.appointment_start_time)}</p>
                        <p>Queue Position: {appointment.queue_position}</p>
                        <p>Status: {appointment.status}</p>
                        <p>Estimated Wait: {appointment.estimated_wait} mins</p>
                        {appointment.status !== "completed" && (
                            <p>Expected Start: {formatEstimatedTime(appointment.estimated_start_time)}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Appointments