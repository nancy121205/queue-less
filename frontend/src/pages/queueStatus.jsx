import { useState, useEffect} from "react"
import { useParams } from "react-router-dom"
import axios from "axios"

function QueueStatus() {
    const {id: availabilityID} = useParams()
    const [queue, setQueue] = useState([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [selectedPatient, setSelectedPatient] = useState(null)

    const fetchQueue = async () => {
        try {
            setError("")
            const res = await axios.get(
                `http://localhost:8000/queue/${availabilityID}`,
                {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}}
            )
            setQueue(res.data)
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to load Patient Queue")
        }
    }

    useEffect(() => {
        fetchQueue()
    }, [availabilityID])

    const openPopup = (patient) => {
        setSelectedPatient(patient)
        setError("")
        setSuccess("")
    }

    const closePopup = () => {
        setSelectedPatient(null)
    }

    const changeStatus = async (status) => {
        if (!selectedPatient) return

        try {
            const res = await axios.patch(
                `http://localhost:8000/queue/${selectedPatient.entry_id}/status`,
                null,
                {
                    params: { new_status: status },
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
                }
            )

            setSuccess(res.data?.message || "Status updated successfully")
            setError("")
            closePopup()
            fetchQueue()
        } catch (err) {
            setSuccess("")
            setError(err.response?.data?.detail || "Failed to update status")
        }
    }

    return(
        <div>
            <h2>Patient Queue</h2>
            {error && <p>{error}</p>}
            {success && <p>{success}</p>}

            {selectedPatient && (
                <div onClick={closePopup}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <p>Change status for {selectedPatient.patient_name}</p>

                        <button onClick={() => changeStatus("waiting")}>
                            waiting
                        </button>

                        <button onClick={() => changeStatus("called")}>
                            called
                        </button>

                        <button onClick={() => changeStatus("seen")}>
                            seen
                        </button>
                    </div>
                </div>
            )}

            {queue.map((patient) => (
                <div>
                    <h3>Patient</h3>
                    <p>position : {patient.position}</p>
                    <p>patient_id : {patient.patient_id}</p>
                    <p>patient_name : {patient.patient_name}</p>
                    <p>estimated_wait : {patient.estimated_wait}</p>
                    <p>
                        status : {patient.status} - 
                        <button onClick={() => openPopup(patient)}>
                            Change status
                        </button>
                    </p>
                    <p>appointment_start_time : {patient.appointment_start_time}</p>
                </div>
            ))}

            
        </div>
    )
}
export default QueueStatus