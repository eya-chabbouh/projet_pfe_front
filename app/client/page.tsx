"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function EditProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    governorate: "",
    city: "",
    photo: "" as string | File,
  });

  const [photoPreview, setPhotoPreview] = useState<string>("/default-avatar.png");
  const [cities, setCities] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const governorates: Record<string, string[]> = {
    "Tunis": ["Tunis", "La Marsa", "Le Bardo"],
    "Sfax": ["Sfax Ville", "Sakiet Ezzit", "Thyna"],
    "Sousse": ["Sousse Ville", "Hammam Sousse", "Kalaâ Kebira"],
    "Ariana": ["Ariana Ville", "Raoued", "La Soukra"],
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/client/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        const data = res.data;
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.tel,
          birthdate: data.birthdate || "",
          gender: data.genre || "",
          governorate: data.gouvernement || "",
          city: data.ville || "",
          photo: data.photo || "",
        });

        if (data.gouvernement) {
          setCities(governorates[data.gouvernement] || []);
        }

        if (data.photo) {
          setPhotoPreview(
            data.photo.startsWith("http")
              ? data.photo
              : `http://127.0.0.1:8000/storage/${data.photo}`
          );
        }
      })
      .catch(console.error);
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Ce champ est obligatoire.";
    if (!formData.email.trim()) newErrors.email = "Ce champ est obligatoire.";
    if (!formData.phone.trim()) newErrors.phone = "Ce champ est obligatoire.";
    if (!formData.gender) newErrors.gender = "Ce champ est obligatoire.";
    if (!formData.governorate) newErrors.governorate = "Ce champ est obligatoire.";
    if (!formData.city) newErrors.city = "Ce champ est obligatoire.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value.trim() !== "" && errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setFormData({ ...formData, governorate: selected, city: "" });
    setCities(governorates[selected] || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: "" });
    setPhotoPreview("/default-avatar.png");
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);


  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/client/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (res.ok) {
        localStorage.removeItem("token");
        router.push("/");
      } else {
        alert("Erreur lors de la suppression du compte.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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
        setTimeout(() => router.push("/client"), 2000);
      })
      .catch(() => setMessage("Erreur lors de la mise à jour du profil."));
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen bg-gray-100 items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Modifier Profil</h1>

          {message && (
            <div className={`mb-4 p-4 text-center text-white ${message.includes("Erreur") ? "bg-red-500" : "bg-green-500"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Photo */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 group mb-3">
                <img src={photoPreview} alt="Avatar" className="rounded-full w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label htmlFor="photo" className="text-sm bg-white px-3 py-1 rounded cursor-pointer text-blue-600 font-semibold">Changer
                    <input type="file" id="photo" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <button type="button" onClick={handleRemovePhoto} className="text-sm bg-white px-3 py-1 rounded text-red-600 font-semibold">Annuler</button>
                </div>
              </div>
            </div>

            {/* Champs texte */}
            {[
              { label: "Nom", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Téléphone", name: "phone", type: "text" },
              { label: "Date de naissance", name: "birthdate", type: "date" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-gray-700 font-medium">{label} <span className="text-red-500">*</span></label>
                <input
                  type={type}
                  name={name}
                  value={formData[name as keyof typeof formData] as string}
                  onChange={handleChange}
                  className={`w-full border p-3 rounded-md ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
              </div>
            ))}

            {/* Genre */}
            <div className="mb-3">
          <label className="form-label">Genre <span className="text-danger">*</span></label><br />
          {["homme", "femme"].map((value) => (
            <div className="form-check form-check-inline" key={value}>
              <input
                className="form-check-input"
                type="radio"
                name="gender"
                value={value}
                checked={formData.gender === value}
                onChange={handleChange}
              />
              <label className="form-check-label">
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </label>
            </div>
          ))}
          {errors.gender && <div className="text-danger mt-1">{errors.gender}</div>}
        </div>

            {/* Localisation */}
            <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Gouvernorat <span className="text-danger">*</span></label>
            <select
              name="governorate"
              className={`form-select ${errors.governorate ? "is-invalid" : ""}`}
              value={formData.governorate}
              onChange={handleGovernorateChange}
            >
              <option value="">-- Sélectionner --</option>
              {Object.keys(governorates).map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
            {errors.governorate && <div className="invalid-feedback">{errors.governorate}</div>}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Ville <span className="text-danger">*</span></label>
            <select
              name="city"
              className={`form-select ${errors.city ? "is-invalid" : ""}`}
              value={formData.city}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner --</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <div className="invalid-feedback">{errors.city}</div>}
          </div>
        </div>

            {/* Actions */}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">
              Sauvegarder
            </button>
            <button type="button" onClick={() => router.push("/dashbordC")} className="w-full bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700">
              Annuler
            </button>
          </form>
        </div>
      </main>
             {/* Confirmation delete */}
             {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center">
              <p className="text-lg mb-4">Êtes-vous sûr de vouloir supprimer votre compte ?</p>
              <div className="flex justify-center gap-4">
                <button onClick={handleDeleteAccount} className="bg-red-600 text-white px-4 py-2 rounded">Oui</button>
                <button onClick={() => setShowDeleteModal(false)} className="bg-gray-300 px-4 py-2 rounded">Annuler</button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

     
    

