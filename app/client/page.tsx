"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { FaHeart, FaCog, FaSignOutAlt, FaUserEdit, FaTrashAlt, FaLayerGroup, FaEdit,FaEnvelope } from "react-icons/fa";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; image: string; points: number; favorites: number; photo?: string }>({
    name: "",
    image: "",
    points: 0,
    favorites: 0,
  });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);  
  const [formData, setFormData] = useState<any>({
    name: "",
    photo: null,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPointsDetails, setShowPointsDetails] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
console.log("Token:", token); // Check the value
    axios
      .get("http://127.0.0.1:8000/api/client/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setUser(res.data);
        setFormData({ name: res.data.name, photo: res.data.photo });
        if (res.data.photo) {
          if (res.data.photo.startsWith("http")) {
            setPhotoPreview(res.data.photo); // Google/Facebook Image
          } else {
            setPhotoPreview(`http://127.0.0.1:8000/storage/${res.data.photo}`); // Laravel Storage
          }
        } else {
          setPhotoPreview("/default-avatar.png"); // Image par défaut
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
      setPhotoPreview(URL.createObjectURL(e.target.files[0])); 
    }
  };

  const handleDeleteAccount = () => {
    axios
      .delete("http://127.0.0.1:8000/api/client/delete", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        localStorage.removeItem("token");
        router.push("/login");
      })
      .catch((err) => console.error(err));
  };

  const handleShowPoints = () => {
    setShowPointsDetails(!showPointsDetails);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFormData = new FormData();
    updatedFormData.append("name", formData.name);

    if (formData.photo) {
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
        router.push("/client");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <Link href="/dashbordC">
          <button className="mt-4 text-blue-500 hover:text-blue-700 transition duration-200">Retour </button>
        </Link>
        {/* Profil Image Section */}
        <div className="relative w-28 h-28 mx-auto">
        <img
            src={photoPreview || "/default-avatar.png"}
            alt="Profil"
            className="w-full h-full object-cover rounded-full cursor-pointer"
            onClick={() => (document.querySelector("#file-input") as HTMLInputElement)?.click()}
          />
          {/* Button to trigger file input */}
          <label
            htmlFor="file-input"
            className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full cursor-pointer"
          >
            <FaEdit className="text-white" />
          </label>
        </div>

        {/* User Name */}
        <h1 className="text-2xl font-semibold mt-4 text-gray-900 text-center">{user.name}</h1>
        
        {/* Favorites and Points Section */}
        <div className="flex justify-center gap-4 mt-3">
          <Link
            href="/favoris"
            className="bg-gray-100 px-4 py-2 rounded-lg shadow text-center cursor-pointer"
          >
            <FaHeart className="text-red-500 mx-auto" />
            <p className="text-sm text-gray-600">Favoris</p>
            <p className="text-lg font-semibold text-gray-900">{user.favorites}</p>
          </Link>

          
        </div>

        

        {/* Actions Section */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push("/client/edit")}
            className="flex items-center justify-between w-full bg-gray-900 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition"
          >
            <span>Modifier mes informations</span>
            <FaUserEdit />
          </button>
          <button
            onClick={() => router.push("/client/categorie")}
            className="flex items-center justify-between w-full bg-gray-900 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition"
          >
            <span>Modifier mes catégories</span>
            <FaLayerGroup />
          </button>
          <button
            onClick={() => router.push("/client/settings")}
            className="flex items-center justify-between w-full bg-gray-900 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition"
          >
            <span>Paramètres (Mot de passe)</span>
            <FaCog />
          </button>
          <button
              onClick={() => router.push("/contact")}
              className="flex items-center justify-between w-full bg-gray-900 hover:bg-blue-500 text-white py-3 px-4 rounded-lg transition"
            >
              <span>Connectez-nous</span>
              <FaEnvelope />
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center justify-between w-full bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-lg transition"
          >
            <span>Supprimer mon compte</span>
            <FaTrashAlt />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="mt-6 w-full flex items-center justify-between bg-gray-900 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition"
        >
          <span>Déconnexion</span>
          <FaSignOutAlt />
        </button>

        {/* Delete Account Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-semibold">Êtes-vous sûr de vouloir supprimer votre compte ?</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Oui
                </button>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File input for updating profile image */}
      <div className="hidden">
        <input
          type="file"
          id="file-input"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
