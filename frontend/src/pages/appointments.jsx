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
            .catch(() => setError("Failed to load doctors"))
        }
        fetchAppointments()

        const interval = setInterval(() => {
            fetchAppointments()
        }, 120000)

        return () => clearInterval(interval)
    }, [])
    return(
        <div>   
            <h2>Appointments made</h2>
            <div>
                {appointments.map(appointment => (
                    <div key={appointment.id}>
                        <h4>Appointment</h4>
                        <p>Date: {appointment.date}</p>
                        <p>Doctor: {appointment.doctor}</p>
                        <p>Hospital: {appointment.hospital}</p>
                        <p>Start Time: {appointment.appointment_start_time}</p>
                        <p>Queue Position: {appointment.queue_position}</p>
                        <p>Status: {appointment.status}</p>
                        <p>Estimated wait: {appointment.estimated_wait}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Appointments