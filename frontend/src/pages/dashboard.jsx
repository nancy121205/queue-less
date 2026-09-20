import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import AppShell from "../components/ui/AppShell"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import { alertErrorClass, fieldClass } from "../components/ui/formStyles"

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
        <AppShell
            title="Patient dashboard"
            description="Upload a report for an AI summary, then book a visit with a specialist."
        >
            <div className="mb-6">
                <Button variant="secondary" onClick={() => navigate("/appointments/")}>
                    View Appointments
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Upload medical report" description="PDF or image files. We extract text and highlight key findings.">
                    <div className="space-y-4">
                        <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700"
                        />
                        <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                            {uploading ? "Processing..." : "Upload Report"}
                        </Button>

                        {error && <p className={alertErrorClass}>{error}</p>}

                        {reportPreview && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <h4 className="text-sm font-semibold text-slate-900">Extracted Text (preview)</h4>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{reportPreview}</p>
                            </div>
                        )}

                        {summary && (
                            <div className="space-y-2 text-sm leading-6 text-slate-700">
                                <h4 className="font-semibold text-slate-900">AI Summary</h4>
                                <p><strong>Summary:</strong> {summary.summary}</p>
                                <p><strong>Key Findings:</strong> {summary.key_findings.join(", ") || "None found"}</p>
                                <p><strong>Abnormal Values:</strong> {summary.abnormal_values.join(", ") || "None found"}</p>
                                <p><strong>Diagnoses:</strong> {summary.diagnoses.join(", ") || "None found"}</p>
                                <p><strong>Medications:</strong> {summary.medications.join(", ") || "None found"}</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Book new appointment" description="Search by specialization to find a doctor.">
                    <input
                        type="text"
                        placeholder="Search specialization..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`${fieldClass} mb-4`}
                    />

                    <div className="space-y-3">
                        {error && <p className={alertErrorClass}>{error}</p>}
                        {filteredDoctors.map(doctor => (
                            <div key={doctor.id} className="rounded-lg border border-slate-200 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
                                        <p className="mt-1 text-sm text-slate-600">Specialization: {doctor.specialization}</p>
                                        <p className="text-sm text-slate-600">Hospital: {doctor.hospital_name}</p>
                                        <p className="text-sm text-slate-600">Avg Consult Time: {doctor.avg_consult_mins} mins</p>
                                        <p className="text-sm text-slate-600">Fees: {doctor.fees}</p>
                                    </div>
                                    <Button size="sm" onClick={() => navigate("/doctor-profile/" + doctor.id)}>
                                        Book Appointment
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AppShell>
    )
}
export default Dashboard
