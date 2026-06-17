import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

function DoctorProfile(){
    // useParams() reads the id from the URL route /doctor-profile/:id, and you rename it to doctorId.
    const {id: doctorId} = useParams()
    const [info, setInfo] = useState({})
    const [appointments, setAppointments] = useState([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(`http://localhost:8000/doctors/${doctorId}`)
            .then(res => setInfo(res.data))
            .catch(() => setError("Failed to load Doctor's information"))
    }, [doctorId])

    useEffect(() => {
        axios.get(`http://localhost:8000/doctors/${doctorId}/availability`)
            .then(res => setAppointments(res.data))
            .catch(() => setError("Failed to load appointments"))
    }, [doctorId])

    async function handleBook(availability_id) {
        try{
            setError("")
            setSuccess("")
            const response = await axios.post("http://localhost:8000/appointments", 
                {doctor_id: doctorId, availability_id : availability_id},
                {headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
            );
            setSuccess(response.data.message + ` Start time: ${response.data.start_time}`)
            setError("")
        }
        catch(err){
            setSuccess("")
            setError(err.response?.data?.detail || "Error in booking appointment"); 
        }
    }
    return(
        <div>
            <h1>Doctor Profile</h1>
            {error && <p>{error}</p>}
            {success && <p>{success}</p>}

            <div>
                <h2>Doctor information:</h2>
                <div>
                    <p>Name: {info.name}</p>
                    <p>Email: {info.email}</p>
                    <p>Specialization: {info.specialization}</p>
                    <p>Hospital: {info.hospital_name}</p>
                    <p>Consult time: {info.avg_consult_mins} mins</p>
                    <p>Fees: {info.fees}</p>
                </div>

                <h2>Slots availabile:</h2>
                {appointments.map((appointment) => (
                    <div>
                        <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
                        <p>Start: {new Date(appointment.start_time).toLocaleTimeString()}</p>
                        <p>End: {new Date(appointment.end_time).toLocaleTimeString()}</p>
                        <p>Spots left: {appointment.max_patients - appointment.booked_patients}</p>

                        <button onClick={() => handleBook(appointment.id)}>
                            Book slot
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default DoctorProfile