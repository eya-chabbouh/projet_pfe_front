"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function EditProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    governorate: "",
    city: "",
    googleId: "",
    facebookId: "",
    photo: "" as string | File,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [cities, setCities] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null); // État pour le message de retour

  const governorates: Record<string, string[]> = {
    "Tunis": ["Tunis", "La Marsa", "Le Bardo"],
    "Sfax": ["Sfax Ville", "Sakiet Ezzit", "Thyna"],
    "Sousse": ["Sousse Ville", "Hammam Sousse", "Kalaâ Kebira"],
    "Ariana": ["Ariana Ville", "Raoued", "La Soukra"],
  };

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGovernorate = e.target.value;
    setFormData({ ...formData, governorate: selectedGovernorate, city: "" });
    setCities(governorates[selectedGovernorate] || []);
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/client/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setFormData({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.tel,
          birthdate: res.data.birthdate || "",
          gender: res.data.genre || "",
          governorate: res.data.gouvernement || "",
          city: res.data.ville || "",
          photo: res.data.photo || "",
          googleId: res.data.google_id,
          facebookId: res.data.facebook_id,
        });
        if (res.data.photo) {
          if (res.data.photo.startsWith("http")) {
            setPhotoPreview(res.data.photo);
          } else {
            setPhotoPreview(`http://127.0.0.1:8000/storage/${res.data.photo}`);
          }
        } else {
          setPhotoPreview("/default-avatar.png");
        }
      })
      .catch((err) => console.error("Erreur lors de la récupération des données:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: "" });
    setPhotoPreview(null);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      birthdate: "",
      gender: "",
      governorate: "",
      city: "",
      googleId: "",
      facebookId: "",
      photo: "" as string | File,
    });
    setPhotoPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = new FormData();
    updatedFormData.append("name", formData.name);
    updatedFormData.append("email", formData.email);
    updatedFormData.append("tel", formData.phone);
    updatedFormData.append("birthdate", formData.birthdate);
    updatedFormData.append("genre", formData.gender);
    updatedFormData.append("gouvernement", formData.governorate);
    updatedFormData.append("ville", formData.city);

    if (formData.photo && formData.photo instanceof File) {
      updatedFormData.append("photo", formData.photo);
    }

    axios
      .post("http://127.0.0.1:8000/api/client/profile/update", updatedFormData, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setMessage("Profil mis à jour avec succès !");
        setTimeout(() => router.push("/client"), 2000); // Redirection après 2 secondes
      })
      .catch((err) => {
        setMessage("Erreur lors de la mise à jour du profil.");
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Modifier mon profil</h1>
        <Link href="/client">
          <button className="mt-4 text-blue-500 hover:text-blue-700 transition duration-200">Retour</button>
        </Link>
        {/* Message de succès ou d'erreur */}
        {message && (
          <div
            className={`mb-4 p-4 text-center text-white ${message.includes("Erreur") ? "bg-red-500" : "bg-green-500"}`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo de Profil */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-36 h-36 mb-4">
              <img
                src={photoPreview || "/default-avatar.png"}
                alt="Profil"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="space-x-4">
              <button
                type="button"
                onClick={() => (document.querySelector("#file-input") as HTMLInputElement).click()}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Télécharger une photo
              </button>

              <button
                type="button"
                onClick={handleRemovePhoto}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Annuler la photo
              </button>
            </div>
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-gray-700">NOM et Prenom</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nom complet"
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-gray-700">Téléphone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Téléphone"
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Genre */}
          <div className="flex space-x-6 mb-4">
            <label htmlFor="gender" className="block text-gray-700">Genre</label>
            <div>
              <input
                type="checkbox"
                id="male"
                name="gender"
                value="homme"
                checked={formData.gender === "homme"}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="male">Homme</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="female"
                name="gender"
                value="femme"
                checked={formData.gender === "femme"}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="female">Femme</label>
            </div>
          </div>

          {/* Gouvernorat et Ville */}
          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="governorate" className="block text-gray-700">Gouvernorat</label>
              <select
                name="governorate"
                value={formData.governorate}
                onChange={handleGovernorateChange}
                className="w-full p-4 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner un gouvernorat</option>
                {Object.keys(governorates).map((gov, index) => (
                  <option key={index} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            <div className="w-1/2">
              <label htmlFor="city" className="block text-gray-700">Ville</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner une ville</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Boutons */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none transition duration-200"
          >
            Sauvegarder
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none transition duration-200"
          >
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
}
