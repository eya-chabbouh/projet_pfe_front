"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Eye, EyeOff } from "lucide-react"; 
import { FaFacebookF, FaGoogle } from "react-icons/fa";


// Composant pour la barre de navigation
function Navbar() {
  return (
    <nav className="navbar navbar-expand-sm bg-info navbar-light">
      <div className="container-fluid">
       {/*  <img
          src="image.ico"
          alt="Logo"
          width="30"
          height="24"
          className="d-inline-block align-text-top"
        /> */}
        <div className="input-group">

        <Link className="navbar-brand" href="/#">
            e-commerce
        </Link>
        <Link className="navbar-brand" href="/">
          Accueil
        </Link>
        <Link className="navbar-brand" href="/contact">
          Contactez-nous
        </Link>
        </div>
        <div className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
            Connexion
          </a>
          <ul className="dropdown-menu">
            <li>
              <Link className="dropdown-item" href="#">
                Profil
              </Link>
            </li>
            <li>
              <Link className="nav-link" href="/deconnexion">
                Déconnexion
              </Link>
            </li>
          </ul>
         
        </div>
      </div>
    </nav>
  );
}

// Composant de connexion
export default function Login({ isLogin = true }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // État pour afficher ou masquer le mot de passe

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

        localStorage.setItem("token", response.data.token); // Stocke le token

        // Rediriger l'utilisateur vers le tableau de bord approprié
        window.location.href = response.data.redirect_url;
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        alert("Une erreur est survenue. Veuillez vérifier vos informations.");
    }
};

  return (
    <div>
      <Navbar /> {/* Affichage de la barre de navigation */}

      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">

        {/*  
         <div className="d-none d-md-block w-70">
          <img src="favicon.ico" alt="Illustration" className="img-fluid h-100 object-cover" />
        </div> */}

      <div className="card w-96 bg-white shadow-xl rounded-xl p-8">
        
        <h2 className="text-center mb-4">{isLogin ? "Connexion" : "Inscription"}</h2>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Adresse email</label>
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

           {/*  <label htmlFor="forgotPassword" className="label text-gray-600">
                    <a
                    href="oublier"
                    className="text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                    <span className="label-text">Mot de passe oublié ?</span>
                    </a>
                </label> */}
                 
            <div className="mb-4 flex items-center">
                <input type="checkbox" id="rememberMe" className="mr-2" />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">Se souvenir de moi </label>
                <div className="ml-4">
                <label htmlFor="forgotPassword" className="label text-gray-600">
                    <a href="oublier" className="text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <span className="label-text">Mot de passe oublié ?</span>
                    </a>
                </label>
                </div>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>

            
              {/* button avec icon google et fecbook  */}
             <button
                type="button"
                className="btn btn-danger w-full text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition duration-300 mt-3 d-flex align-items-center justify-content-center"
                onClick={() => window.location.href = 'http://127.0.0.1:8000/auth/google'}
              >
                <FaGoogle size={20} className="mr-2" />
                {isLogin ? "Se connecter avec Google" : "S'inscrire avec Google"}
              </button>


            <button
              type="button"
              className="btn btn-primary w-full text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition duration-300 mt-3 d-flex align-items-center justify-content-center"
              >
              <FaFacebookF size={20} className="mr-2" />
              {isLogin ? "Se connecter avec Facebook" : "S'inscrire avec Facebook"}
            </button> 

          </form>

          <div className="text-center mt-3">
            <p>
              {isLogin ? "vous n'avez pas un compte?" : "Vous avez déjà un compte ?"}
              <Link href="register" className="text-primary fw-bold">
                {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
              </Link>
            </p>
          </div>
          </div>
      </div>
    </div>
  );
}














