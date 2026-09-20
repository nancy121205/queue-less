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

function PatientProfile() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
        setError("");
      })
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
        "http://localhost:8000/auth/me",
        { name, phone, email },
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
      title="Your profile"
      description="Update the contact details used for appointments and queue alerts."
    >
      <Card className="max-w-lg">
        {error && <p className={`mb-4 ${alertErrorClass}`}>{error}</p>}
        {success && <p className={`mb-4 ${alertSuccessClass}`}>{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

export default PatientProfile;
