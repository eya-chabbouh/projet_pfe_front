"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Eye, EyeOff } from "lucide-react"; 
import { FaFacebookF, FaGoogle } from "react-icons/fa";

export default function Login({ isLogin = true }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });
      console.log("Connexion réussie:", response.data);
      alert("Connexion réussie.");
      localStorage.setItem("token", response.data.token);
      window.location.href = response.data.redirect_url;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      alert("Une erreur est survenue. Veuillez vérifier vos informations.");
    }
  };
  
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg rounded p-5 border-0">
            <h2 className="text-center mb-4 text-primary fw-bold">
              {isLogin ? "Connexion" : "Inscription"}
            </h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">Adresse email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control rounded-pill"
                  placeholder="Entrez votre adresse email"
                  required
                />
              </div>
              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label fw-semibold">Mot de passe</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control rounded-pill pe-5"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <input type="checkbox" id="rememberMe" className="me-2" />
                  <label htmlFor="rememberMe" className="text-muted">Se souvenir de moi</label>
                </div>
                <Link href="oublier" className="text-decoration-none text-primary">Mot de passe oublié ?</Link>
              </div>
              <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2">
                {isLogin ? "Se connecter" : "S'inscrire"}
              </button>
              <div className="text-center my-3 text-muted">ou</div>
              <button
                type="button"
                className="btn btn-outline-danger w-100 rounded-pill d-flex align-items-center justify-content-center py-2"
              
              >
                <FaGoogle size={20} className="me-2" /> {isLogin ? "Se connecter avec Google" : "S'inscrire avec Google"}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary w-100 rounded-pill d-flex align-items-center justify-content-center mt-2 py-2"
               
              >
                <FaFacebookF size={20} className="me-2" /> {isLogin ? "Se connecter avec Facebook" : "S'inscrire avec Facebook"}
              </button>
            </form>
            <div className="text-center mt-3">
              <p>
                {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"} 
                <Link href="register" className="text-primary fw-bold ms-1">
                  {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
