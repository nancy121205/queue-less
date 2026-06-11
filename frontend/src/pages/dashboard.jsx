import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Dashboard() {
    const [patient, setPatient] = useState(null)
    const [doctors, setDoctors] = useState([])
    const [search, setSearch] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const filteredDoctors = doctors.filter(doc =>
        doc.specialization.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        axios.get("http://localhost:8000/doctors/")
            .then(res => setDoctors(res.data))
            .catch(() => setError("Failed to load doctors"))
    }, [])
    return (
        <div>
            <h1>Patient Dashboard</h1>
            <p>Welcome, patient!</p>
            
            {error && <p>{error}</p>}

            <input
                type="text"
                placeholder="Search specialization..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <div>
                {filteredDoctors.map(doctor => (
                    <div key={doctor.id}>
                        <h3>{doctor.name}</h3>
                        <button onClick={() => navigate("/doctor-profile/" + doctor.id)}>
                            Book Appointment
                        </button>
                        <p>Specialization: {doctor.specialization}</p>
                        <p>Hospital: {doctor.hospital_name}</p>
                        <p>Avg Consult Time: {doctor.avg_consult_mins} mins</p>
                        <p>Fees: {doctor.fees}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Dashboard