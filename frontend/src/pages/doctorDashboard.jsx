import { useState, useEffect} from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import AppShell from "../components/ui/AppShell"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import { alertErrorClass, alertSuccessClass, fieldClass } from "../components/ui/formStyles"

function DoctorDashboard() {
    const [date, setDate] = useState("")
    const [start_time, setStartTime] = useState("")
    const [end_time, setEndTime] = useState("")
    const [max_patients, setMaxPatients] = useState("")
    const [appointments, setAppointments] = useState([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const startDateTime = `${date}T${start_time}:00`;
            const endDateTime = `${date}T${end_time}:00`;

            if(endDateTime <= startDateTime){
                setError("End time must be after Start Time.");
                setSuccess("");
                return;
            }
            setError("")
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

    useEffect(() => {
        setError("")
        axios.get(
            "http://localhost:8000/appointments/upcoming",
            {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}}
        ).then(res => {
            setAppointments(res.data)
            setError("")
        }).catch(() => setError("Failed to load upcoming appointments"))
    }, [])

    return (
        <AppShell
            title="Doctor dashboard"
            description="Publish clinic hours and open the live queue for each slot."
        >
        {error && <p className={`mb-4 ${alertErrorClass}`}>{error}</p>}
        {success && <p className={`mb-4 ${alertSuccessClass}`}>{success}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Add new availability">
        <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
                <span className="text-sm font-medium text-slate-700">Date</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={fieldClass} />
            </label>
            <label className="block">
                <span className="text-sm font-medium text-slate-700">Start time</span>
                <input type="time" value={start_time} onChange={(e) => setStartTime(e.target.value)} required className={fieldClass} />
            </label>
            <label className="block">
                <span className="text-sm font-medium text-slate-700">End time</span>
                <input type="time" value={end_time} onChange={(e) => setEndTime(e.target.value)} required className={fieldClass} />
            </label>
            <label className="block">
                <span className="text-sm font-medium text-slate-700">Max patients</span>
                <input type="number" min="1" value={max_patients} onChange={(e) => setMaxPatients(Number(e.target.value))} required className={fieldClass} />
            </label>
            <Button type="submit">Add Availability</Button>
        </form>
        </Card>

        <Card title="Upcoming appointments">
        <div className="space-y-3">
            {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-lg border border-slate-200 p-4">
                    <p className="text-sm text-slate-700">Date: {appointment.date}</p>
                    <p className="text-sm text-slate-700">Start Time: {appointment.start_time}</p>
                    <p className="text-sm text-slate-700">End Time: {appointment.end_time}</p>
                    <p className="text-sm text-slate-700">Booked patients: {appointment.booked_patients}</p>
                    <p className="text-sm text-slate-700">Max Patients: {appointment.max_patients}</p>
                    <Button className="mt-3" size="sm" onClick={() => navigate("/queue-status/" + appointment.id)}>
                        View Queue
                    </Button>
                </div>
            ))}
        </div>
        </Card>
        </div>

        </AppShell>        
    )
}
export default DoctorDashboard
