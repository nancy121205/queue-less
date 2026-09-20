import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import PublicHeader from "../components/ui/PublicHeader"
import { alertErrorClass, fieldClass } from "../components/ui/formStyles"

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
        <div className="flex min-h-screen flex-col bg-surface-page">
            <PublicHeader />

            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <Card
                    className="w-full max-w-md"
                    title="Sign in"
                    description="Use your clinic account to access your queue, appointments, and reports."
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Email</span>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={fieldClass}
                            />
                        </label>

                        {error && (
                            <p className={alertErrorClass}>
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-slate-600">
                        New to QueueLess?{" "}
                        <Link to="/register" className="font-medium text-primary-700 hover:text-primary-800">
                            Create an account
                        </Link>
                    </p>
                </Card>
            </main>
        </div>
    )
}
export default Login
