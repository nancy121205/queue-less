import { useState, useEffect} from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import AppShell from "../components/ui/AppShell"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Modal from "../components/ui/Modal"
import { alertErrorClass, alertSuccessClass } from "../components/ui/formStyles"

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
        <AppShell
            title="Patient queue"
            description="Call the next patient and update visit status as you go."
        >
            {error && <p className={`mb-4 ${alertErrorClass}`}>{error}</p>}
            {success && <p className={`mb-4 ${alertSuccessClass}`}>{success}</p>}

            <Modal
                open={Boolean(selectedPatient)}
                onClose={closePopup}
                title={selectedPatient ? `Change status for ${selectedPatient.patient_name}` : "Change status"}
            >
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => changeStatus("waiting")}>
                        waiting
                    </Button>
                    <Button onClick={() => changeStatus("called")}>
                        called
                    </Button>
                    <Button variant="danger" onClick={() => changeStatus("seen")}>
                        seen
                    </Button>
                </div>
            </Modal>

            <div className="space-y-3">
            {queue.map((patient) => (
                <Card key={patient.entry_id}>
                    <h3 className="text-base font-semibold text-slate-900">Patient</h3>
                    <p className="mt-2 text-sm text-slate-700">position : {patient.position}</p>
                    <p className="text-sm text-slate-700">patient_id : {patient.patient_id}</p>
                    <p className="text-sm text-slate-700">patient_name : {patient.patient_name}</p>
                    <p className="text-sm text-slate-700">estimated_wait : {patient.estimated_wait}</p>
                    <p className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                        status : <Badge status={patient.status} />
                        <Button size="sm" variant="secondary" onClick={() => openPopup(patient)}>
                            Change status
                        </Button>
                    </p>
                    <p className="text-sm text-slate-700">appointment_start_time : {patient.appointment_start_time}</p>
                </Card>
            ))}
            </div>

            
        </AppShell>
    )
}
export default QueueStatus
