import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

function DoctorProfile(){
    const {id: doctorId} = useParams()
    const [appointments, setAppointments] = useState([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(`http://localhost:8000/doctors/${doctorId}/availability`)
            .then(res => setAppointments(res.data))
            .catch(() => setError("Failed to load appointments"))
    }, [doctorId])
    return(
        <div>
            <h1>Doctor Profile</h1>
            {error && <p>{error}</p>}
            {success && <p>{success}</p>}

            <div>
                {appointments.map((slot) => (
                    <div key={slot.id}>
                        <p>Date: {new Date(slot.date).toLocaleDateString()}</p>
                        <p>Start: {new Date(slot.start_time).toLocaleTimeString()}</p>
                        <p>End: {new Date(slot.end_time).toLocaleTimeString()}</p>
                        <p>Spots left: {slot.max_patients - slot.booked_patients}</p>

                        <button onClick={() => handleBook(slot.id)}>
                            Book slot
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default DoctorProfile