import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Dashboard() {
    const [doctors, setDoctors] = useState([])
    const [search, setSearch] = useState("")
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [reportPreview, setReportPreview] = useState(null); // extracted text preview
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const filteredDoctors = doctors.filter(doc =>
        doc.specialization.toLowerCase().includes(search.toLowerCase())
    )

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            // Step 1: upload + OCR
            const uploadRes = await axios.post(
                "http://localhost:8000/reports/upload",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setReportPreview(uploadRes.data.raw_text_preview);
            const reportId = uploadRes.data.report_id;

            // Step 2: summarize
            const summaryRes = await axios.post(
                `http://localhost:8000/reports/${reportId}/summarize`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSummary(summaryRes.data);
        } catch (err) {
            setError("Upload failed. Please try a different file.");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        setError("")
        axios.get("http://localhost:8000/doctors/")
            .then(res => {
                setDoctors(res.data)
                setError("")
            })
            .catch((err) => setError(err.response?.data?.detail || "Failed to load doctors"))
    }, [])

    return (
        <div>
            <h1>Patient Dashboard</h1>
            <p>Welcome, patient!</p>
            
            <button onClick={() => navigate("/appointments/")}>
                View Appointments
            </button>

            <div className="report-upload-section">
            <h3>Upload Medical Report</h3>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? "Processing..." : "Upload Report"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {reportPreview && (
            <div className="report-preview">
                <h4>Extracted Text (preview)</h4>
                <p>{reportPreview}</p>
            </div>
            )}

            {summary && (
            <div className="ai-summary">
                <h4>AI Summary</h4>
                <p><strong>Summary:</strong> {summary.summary}</p>
                <p><strong>Key Findings:</strong> {summary.key_findings.join(", ") || "None found"}</p>
                <p><strong>Abnormal Values:</strong> {summary.abnormal_values.join(", ") || "None found"}</p>
                <p><strong>Diagnoses:</strong> {summary.diagnoses.join(", ") || "None found"}</p>
                <p><strong>Medications:</strong> {summary.medications.join(", ") || "None found"}</p>
            </div>
            )}
        </div>
            
            <h2>Book new Appointment</h2>
            <input
                type="text"
                placeholder="Search specialization..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <div>
                {error && <p>{error}</p>}
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