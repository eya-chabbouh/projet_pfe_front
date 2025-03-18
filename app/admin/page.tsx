"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "../admin/style.css"; // Assurez-vous que le chemin est correct

export default function AdminProfile() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [lname, setLname] = useState(""); // Utilisation de lname au lieu de lastName
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Récupérer les données du profil actuel depuis le backend
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Aucun token trouvé");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/admin/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Vérification si la photo est null et utilisation d'une photo par défaut si c'est le cas
        setName(response.data.user.name);
        setLname(response.data.user.lname); // Utilisation de lname
        setEmail(response.data.user.email);
        setPhoto(response.data.user.photo ? response.data.user.photo : "/default-avatar.png");
      } catch (error: unknown) {
        console.error("Erreur lors de la récupération du profil :", error);
        setError("Échec du chargement du profil");
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de la confirmation du mot de passe
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Vérification que le champ name est non vide avant l'envoi
    if (!name.trim()) {
      setError("Le champ nom est requis");
      return;
    }

    // Vérification que l'email est valide
    if (!email.trim()) {
      setError("Le champ email est requis");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez entrer un email valide");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("lname", lname); // Utilisation de lname
    formData.append("email", email); // Assurez-vous que l'email est bien envoyé
    formData.append("new_password", newPassword);
    formData.append("new_password_confirmation", confirmPassword);

    // Ajouter le fichier photo si il existe
    const photoInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (photoInput && photoInput.files?.[0]) {
      formData.append("photo", photoInput.files[0]);
    }

    // Afficher les données envoyées dans la console pour déboguer
    console.log("Form Data:", formData);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put("http://localhost:8000/api/admin/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Make sure this is set
        },
      });

      // Mettez à jour l'état avec les données mises à jour
      setName(response.data.user.name);
      setLname(response.data.user.lname);
      setEmail(response.data.user.email);
      setPhoto(response.data.user.photo || "/default-avatar.png");
      setMessage("Profil mis à jour avec succès");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.message || "Échec de la mise à jour du profil");
        console.error("Backend Error: ", error.response?.data);
      } else {
        setError("Échec de la mise à jour du profil");
        console.error("Unknown error: ", error);
      }
    }
  };

  const handleCancel = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2>Profil Administrateur</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="profile-photo">
            <img
              src={photo || "/default-avatar.png"} // Utilisation de photo par défaut si vide
              alt="Photo de Profil"
              className="profile-image"
            />
            <input
              type="file"
              accept="image/*"
              className="file-input"
            />
          </div>

          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Prénom</label>
            <input
              type="text"
              value={lname} // Utilisation de lname
              onChange={(e) => setLname(e.target.value)} // Modification de lname
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} // Ajout de l'event handler pour l'email
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}

          <div>
            <button type="submit" className="update-button">Modifier</button>
            <button type="button" onClick={handleCancel} className="back-button">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}