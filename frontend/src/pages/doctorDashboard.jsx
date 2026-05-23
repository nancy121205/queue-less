import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function DoctorDashboard() {
    const [date, setDate] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [maxPatients, setMaxPatients] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await axios.post("http://localhost:8000/doctors/availability", {
                date, 
                start_time: startTime,
                end_time: endTime,
                max_patients: Number(maxPatients)
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
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            <input type="number" min="1" value={maxPatients} onChange={(e) => setMaxPatients(e.target.value)} required />
            <button type="submit">Add Availability</button>
        </form>
        {error && <p>{error}</p>}
        {success && <p>{success}</p>}
        </div>        
    )
}
export default DoctorDashboard