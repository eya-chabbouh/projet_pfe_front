"use client";

import axios from 'axios'; 
import Link from 'next/link';
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; 

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibility2 = () => {
    setShowPassword2(!showPassword2);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
    } else {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/register', {
          name,
          email,
          password,
          password_confirmation: confirmPassword,
        });
        console.log("Inscription réussie:", response.data);
        alert("Inscription réussie.");
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg rounded p-5 border-0">
            <h2 className="text-center mb-4 text-primary fw-bold">Inscription</h2>
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-semibold">Nom</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control rounded-pill"
                  placeholder="Entrez votre nom"
                  required
                />
              </div>
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
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control rounded-pill pe-5"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <span className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
              </div>
              <div className="mb-3 position-relative">
                <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirmer le mot de passe</label>
                <div className="position-relative">
                  <input
                    type={showPassword2 ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control rounded-pill pe-5"
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                  <span className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer" onClick={togglePasswordVisibility2}>
                    {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
              </div>
              <div className="text-center mt-3">
                <p className="text-muted">
                  Déjà inscrit(e) ?
                  <Link href="login" className="text-primary fw-bold ms-1">Connectez-vous</Link>
                </p>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-pill fw-bold py-2"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
