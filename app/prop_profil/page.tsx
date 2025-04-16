"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function AdminProfile() {
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    tel: "",
    photo: "",
    role: "",
  });

  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // ✅ Nouveau
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const getDefaultAvatar = (role: string) => {
    return "/default-avatar.png";
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://127.0.0.1:8000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmin({
        name: response.data.name ?? "",
        email: response.data.email ?? "",
        tel: response.data.tel ?? "",
        photo: response.data.photo ?? "",
        role: response.data.role ?? "client",
      });
    } catch (error) {
      console.error("Erreur lors du chargement du profil :", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("name", admin.name);
    formData.append("email", admin.email);
    formData.append("tel", admin.tel);
    if (newPhoto) formData.append("photo", newPhoto);

    if (showPasswordFields && password) {
      formData.append("current_password", currentPassword);
      formData.append("password", password);
      formData.append("password_confirmation", passwordConfirmation);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Aucun token trouvé.");
        return;
      }

      const response = await axios.post("http://127.0.0.1:8000/api/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage(response.data.message || "Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMessage(""), 4000); // ✅ Disparition auto

      fetchProfile();
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setShowPasswordFields(false);
      setNewPhoto(null);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const err = error.response.data;
        setErrorMessage(err.error || "Une erreur s'est produite.");
      } else {
        setErrorMessage("Une erreur inattendue s'est produite.");
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNewPhoto(file);
  };

  const handleCancelPhoto = () => {
    setNewPhoto(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <Link href="dashbord2">
          <button className="mb-4 text-blue-500 hover:underline"> ← Retour</button>
        </Link>

        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Mon Profil</h2>

        {/* ✅ Message de succès */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center font-medium">
            {successMessage}
          </div>
        )}

        {/* ⚠️ Message d'erreur */}
        {errorMessage && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          {/* Photo de profil */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <img
                src={
                  newPhoto
                    ? URL.createObjectURL(newPhoto)
                    : admin.photo
                    ? `http://127.0.0.1:8000/storage/${admin.photo}`
                    : getDefaultAvatar(admin.role)
                }
                alt="Photo de profil"
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-300 shadow-md"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center gap-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <label
                  htmlFor="photo-input"
                  className="bg-white text-sm text-blue-600 font-semibold px-3 py-1 rounded cursor-pointer hover:bg-blue-100"
                >
                  Changer
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
                {newPhoto && (
                  <button
                    type="button"
                    onClick={handleCancelPhoto}
                    className="bg-white text-sm text-red-600 font-semibold px-3 py-1 rounded hover:bg-red-100"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Infos personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                value={admin.name}
                onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={admin.email}
                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="text"
                value={admin.tel}
                onChange={(e) => setAdmin({ ...admin, tel: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Mot de passe */}
          {!showPasswordFields ? (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowPasswordFields(true)}
                className="text-blue-600 hover:underline text-sm"
              >
                Modifier le mot de passe
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordFields(false);
                    setPassword("");
                    setPasswordConfirmation("");
                    setCurrentPassword("");
                  }}
                  className="text-red-500 text-sm hover:underline"
                >
                  Annuler la modification du mot de passe
                </button>
              </div>
            </div>
          )}

          {/* Bouton Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Mettre à jour
          </button>
        </form>
      </div>
    </div>
  );
}
