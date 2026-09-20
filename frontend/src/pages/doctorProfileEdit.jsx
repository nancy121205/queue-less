import { useEffect, useState } from "react";
import axios from "axios";
import AppShell from "../components/ui/AppShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  alertErrorClass,
  alertSuccessClass,
  fieldClass,
} from "../components/ui/formStyles";

function DoctorProfileEdit() {
  const [specialization, setSpecialization] = useState("");
  const [hospital_name, setHospitalName] = useState("");
  const [avg_consult_mins, setAvgConsultMins] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((me) =>
        axios.get("http://localhost:8000/doctors/").then((res) => {
          const profile = res.data.find((doctor) => doctor.email === me.data.email);
          if (!profile) {
            setError("Doctor profile not found.");
            return;
          }
          setSpecialization(profile.specialization || "");
          setHospitalName(profile.hospital_name || "");
          setAvgConsultMins(profile.avg_consult_mins || "");
          setError("");
        })
      )
      .catch((err) =>
        setError(err.response?.data?.detail || "Failed to load profile")
      );
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await axios.put(
        "http://localhost:8000/doctors/me",
        { specialization, hospital_name, avg_consult_mins },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSuccess("Profile saved.");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      title="Clinic profile"
      description="These details appear when patients search for a doctor."
    >
      <Card className="max-w-lg">
        {error && <p className={`mb-4 ${alertErrorClass}`}>{error}</p>}
        {success && <p className={`mb-4 ${alertSuccessClass}`}>{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Specialization</span>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Hospital name</span>
            <input
              type="text"
              value={hospital_name}
              onChange={(e) => setHospitalName(e.target.value)}
              required
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Average consult time (minutes)</span>
            <input
              type="number"
              min="1"
              value={avg_consult_mins}
              onChange={(e) => setAvgConsultMins(Number(e.target.value))}
              required
              className={fieldClass}
            />
          </label>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}

export default DoctorProfileEdit;
