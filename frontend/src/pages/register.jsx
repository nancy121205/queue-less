import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import PublicHeader from "../components/ui/PublicHeader"
import { alertErrorClass, fieldClass } from "../components/ui/formStyles"

function Register() {

    const[selectedRole, setSelectedRole] = useState("patient")
    const[name, setName] = useState("")
    const[email, setEmail] = useState("")
    const[password, setPassword] = useState("")
    const[specialization, setSpecialization] = useState("")
    const[avg_consult_mins, setAvg_consult_mins] = useState("")
    const[hospital_name, setHospital_name] = useState("")
    const[fees, setFees] = useState("")
    const[error, setError] = useState("")

    const navigate = useNavigate()

    async function handleSubmitPatient(e) {
        e.preventDefault()
        try {
            const response = await axios.post("http://localhost:8000/auth/register/user", {
                name, email, password, role : selectedRole
            })
            localStorage.setItem("token", response.data.access_token)
            navigate("/dashboard")
            
        } catch (err) {
            setError(err.response.data.detail)
        }
    }

    async function handleSubmitDoctor(e) {
        e.preventDefault()
        try {
            const response = await axios.post("http://localhost:8000/auth/register/doctor", {
                name, email, password, role : selectedRole, specialization, avg_consult_mins, hospital_name, fees
            })
            localStorage.setItem("token", response.data.access_token)
            navigate("/doctor-dashboard")
            
        } catch (err) {
            setError(err.response.data.detail)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-surface-page">
            <PublicHeader />
            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <Card
                    className="w-full max-w-lg"
                    title="Create an account"
                    description="Register as a patient to book visits, or as a doctor to manage your clinic schedule."
                >
                    <div className="mb-5 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                        <button
                            type="button"
                            onClick={() => setSelectedRole("patient")}
                            className={`rounded-md px-3 py-2 text-sm font-medium ${
                                selectedRole === "patient"
                                    ? "bg-white text-primary-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Patient
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRole("doctor")}
                            className={`rounded-md px-3 py-2 text-sm font-medium ${
                                selectedRole === "doctor"
                                    ? "bg-white text-primary-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Doctor
                        </button>
                    </div>

                    {selectedRole === "patient" && (
                        <form onSubmit={handleSubmitPatient} className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Name</span>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Email</span>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Password</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <Button type="submit" className="w-full">Register as Patient</Button>
                        </form>
                    )}

                    {selectedRole === "doctor" && (
                        <form onSubmit={handleSubmitDoctor} className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Name</span>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Email</span>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Password</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Specialization</span>
                                <input
                                    type="text"
                                    placeholder="Specialization"
                                    value={specialization}
                                    onChange={e => setSpecialization(e.target.value)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Average consult (minutes)</span>
                                <input
                                    type="number"
                                    placeholder="Avg consult mins"
                                    value={avg_consult_mins}
                                    onChange={e => setAvg_consult_mins(Number(e.target.value))}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Hospital name</span>
                                <input
                                    type="text"
                                    placeholder="Hospital name"
                                    value={hospital_name}
                                    onChange={e => setHospital_name(e.target.value)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Fees</span>
                                <input
                                    type="number"
                                    placeholder="Fees"
                                    value={fees}
                                    onChange={e => setFees(Number(e.target.value))}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <Button type="submit" className="w-full">Register as Doctor</Button>
                        </form>
                    )}
                    {error && <p className={`mt-4 ${alertErrorClass}`}>{error}</p>}

                    <p className="mt-4 text-center text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-primary-700 hover:text-primary-800">
                            Sign in
                        </Link>
                    </p>
                </Card>
            </main>
        </div>
    )
}
export default Register
