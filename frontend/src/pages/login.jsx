import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Login() {
    const[email, setEmail] = useState("")
    const[password, setPassword] = useState("")
    const[error, setError] = useState("")

    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        try{
            const response = await axios.post("http://localhost:8000/auth/login", {
                email, password
            })
            localStorage.setItem("token", response.data.access_token)

            const me = await axios.get("http://localhost:8000/auth/me", {
                headers: { Authorization: `Bearer ${response.data.access_token}` }
            })
            if (me.data.role === "doctor") {
                navigate("/doctor-dashboard")
            } else {
                navigate("/dashboard")
            }
        }
        catch(err) {
            setError(err.response.data.detail)
        }
    }
    return(
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
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

                <button type="submit">Login</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    )
}
export default Login