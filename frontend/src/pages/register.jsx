import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Register() {
    const[name, setName] = useState("")
    const[email, setEmail] = useState("")
    const[password, setPassword] = useState("")
    const[role, setRole] = useState("patient")
    const[error, setError] = useState("")

    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const response = await axios.post("http://localhost:8000/auth/register", {
                name, email, password, role
            })
            localStorage.setItem("token", response.data.access_token)
            if (role === "doctor") {
                navigate("/doctor-dashboard")
            } else {
                navigate("/dashboard")
            }
        } catch (err) {
            setError(err.response.data.detail)
        }
    }

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                />

                <input 
                    type="email" 
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                />

                <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                />

                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                </select>

                <button type="submit">Register</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    )
}
export default Register
