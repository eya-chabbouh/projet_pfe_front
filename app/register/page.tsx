"use client"; 

import axios from 'axios'; 
import Link from 'next/link';
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; 

export default function Register() {
  const [name, setName] = useState(""); // Ajout d'un champ pour le nom
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
        // Envoi des données d'inscription à l'API avec tous les champs nécessaires
        const response = await axios.post('http://127.0.0.1:8000/api/register', {
          name,            // Nom de l'utilisateur ajouté
          email,
          password,
          password_confirmation: confirmPassword, // Le champ de confirmation du mot de passe
        });
        console.log("Inscription réussie:", response.data);
        alert("Inscription réussie.");
        // Rediriger ou informer l'utilisateur ici
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="card w-96 bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          Inscription
        </h2>

        <form onSubmit={handleRegister}>
          <div className="mb-6">
            <label htmlFor="name" className="label text-gray-600">
              <span className="label-text">Nom</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Entrez votre nom"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="label text-gray-600">
              <span className="label-text">Adresse email</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Entrez votre adresse email"
              required
            />
          </div>

          <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                  <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="label text-gray-600">
              <span className="label-text">Confirmer le mot de passe</span>
            </label>
            <div className="input-group">
            <input
                  type={showPassword2 ? "text" : "password"}
                  id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              placeholder="Confirmez votre mot de passe"
              required
            />
            <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePasswordVisibility2}
                >
                  {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>
      
        <div className="text mt-3">
                <label htmlFor="login" className="label text-gray-600">
                    <a
                    href="login"
                    className="text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                    <span className="label-text">Déja inscrit(e) ?</span>
                    </a>
                </label> 
          </div>

        <button type="submit"
            className="btn btn-primary w-full p-2 text-white shadow-md hover:bg-indigo-700"> S'inscrire 
        </button>

        </form>
      </div>
    </div>
  );
}


