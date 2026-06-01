import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

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
        <div>
            <h1>Register</h1>
            <div>
                <button type="button" onClick={() => setSelectedRole("patient")}>
                    Patient
                </button>
                <button type="button" onClick={() => setSelectedRole("doctor")}>
                    Doctor
                </button>
            </div>

            {selectedRole === "patient" && (
                <form onSubmit={handleSubmitPatient}>
                    <input 
                        type="text" 
                        placeholder="Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required />
                    <button type="submit">Register as Patient</button>

                </form>
            )}

            {selectedRole === "doctor" && (
                <form onSubmit={handleSubmitDoctor}>
                    <input 
                        type="text" 
                        placeholder="Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required />
                    <input 
                        type="text" 
                        placeholder="Specialization" 
                        value={specialization} 
                        onChange={e => setSpecialization(e.target.value)} 
                        required />
                    <input 
                        type="number" 
                        placeholder="Avg consult mins" 
                        value={avg_consult_mins} 
                        onChange={e => setAvg_consult_mins(Number(e.target.value))} 
                        required />
                    <input 
                        type="text" 
                        placeholder="Hospital name" 
                        value={hospital_name} 
                        onChange={e => setHospital_name(e.target.value)} 
                        required />
                    <input 
                        type="number" 
                        placeholder="Fees" 
                        value={fees} 
                        onChange={e => setFees(Number(e.target.value))} 
                        required />
                    <button type="submit">Register as Doctor</button>

                </form>
            )}
            {error && <p>{error}</p>}
        </div>
    )
}
export default Register
