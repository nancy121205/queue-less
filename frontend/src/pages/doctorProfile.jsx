import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import AppShell from "../components/ui/AppShell"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import { alertErrorClass, alertSuccessClass } from "../components/ui/formStyles"

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
            const response = await axios.post("http://localhost:8000/appointments/new", 
                {doctor_id: doctorId, availability_id : availability_id},
                {headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
            );
            setSuccess(response.data.message + ` Start time: ${response.data.estimated_start_time}`)
            setError("")
        }
        catch(err){
            setSuccess("")
            setError(err.response?.data?.detail || "Error in booking appointment"); 
        }
    }
    return(
        <AppShell
            title="Doctor profile"
            description="Review clinic details and book an open slot."
        >
            {error && <p className={`mb-4 ${alertErrorClass}`}>{error}</p>}
            {success && <p className={`mb-4 ${alertSuccessClass}`}>{success}</p>}

            <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Doctor information">
                    <div className="space-y-2 text-sm text-slate-700">
                    <p>Name: {info.name}</p>
                    <p>Email: {info.email}</p>
                    <p>Specialization: {info.specialization}</p>
                    <p>Hospital: {info.hospital_name}</p>
                    <p>Consult time: {info.avg_consult_mins} mins</p>
                    <p>Fees: {info.fees}</p>
                    </div>
                </Card>

                <Card title="Slots available">
                <div className="space-y-3">
                {appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border border-slate-200 p-4">
                        <p className="text-sm text-slate-700">Date: {new Date(appointment.date).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-700">Start: {new Date(appointment.start_time).toLocaleTimeString()}</p>
                        <p className="text-sm text-slate-700">End: {new Date(appointment.end_time).toLocaleTimeString()}</p>
                        <p className="text-sm text-slate-700">Spots left: {appointment.max_patients - appointment.booked_patients}</p>

                        <Button className="mt-3" size="sm" onClick={() => handleBook(appointment.id)}>
                            Book slot
                        </Button>
                    </div>
                ))}
                </div>
                </Card>
            </div>
        </AppShell>
    )
}
export default DoctorProfile
