import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function DoctorDashboard() {
    const [date, setDate] = useState("")
    const [start_time, setStartTime] = useState("")
    const [end_time, setEndTime] = useState("")
    const [max_patients, setMaxPatients] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const startDateTime = `${date}T${start_time}:00`;
            const endDateTime = `${date}T${end_time}:00`;
            await axios.post("http://localhost:8000/doctors/availability", {
                    date, 
                    start_time : startDateTime, 
                    end_time : endDateTime, 
                    max_patients
                },
                {headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
            );
            setSuccess("Availability added.");
            setDate("");
            setStartTime("");
            setEndTime("");
            setMaxPatients(1);
        } catch (err) {
            setError(err.response?.data?.detail || "Error scheduling appointment")
        }
    }

    return (
        <div>
        <h1>Doctor Dashboard</h1>
        <form onSubmit={handleSubmit}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input type="time" value={start_time} onChange={(e) => setStartTime(e.target.value)} required />
            <input type="time" value={end_time} onChange={(e) => setEndTime(e.target.value)} required />
            <input type="number" min="1" value={max_patients} onChange={(e) => setMaxPatients(Number(e.target.value))} required />
            <button type="submit">Add Availability</button>
        </form>
        {error && <p>{error}</p>}
        {success && <p>{success}</p>}
        </div>        
    )
}
export default DoctorDashboard