"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/components/AdminLayout/page";
import 'bootstrap/dist/css/bootstrap.min.css';

interface Category {
  nom: string;
  image: string;
}

const AddCategoryPage = () => {
  const [category, setCategory] = useState<Category>({ nom: "", image: "" });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState({ nom: "", image: "" });
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { nom: "", image: "" };

    if (!category.nom.trim()) {
      newErrors.nom = "Le nom de la catégorie est obligatoire";
      isValid = false;
    } else if (!/^[a-zA-Z\s-_]+$/.test(category.nom)) {
      newErrors.nom = "Le nom ne doit contenir que des lettres, espaces, tirets ou underscores";
      isValid = false;
    }

    if (!image) {
      newErrors.image = "L'image de la catégorie est obligatoire";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("nom", category.nom);
      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      await axios.post("http://127.0.0.1:8000/api/categories", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Catégorie ajoutée avec succès !");
      setCategory({ nom: "", image: "" });
      setImage(null);
      setErrors({ nom: "", image: "" });

      setTimeout(() => {
        router.push("/categories");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie", error);
      setErrors({ nom: "", image: "Une erreur est survenue lors de l'ajout de la catégorie." });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategory((prev: Category) => ({
      ...prev,
      [name]: value,
    }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      setErrors({ ...errors, image: "" });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Ajouter une catégorie
          </h1>

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm mb-4" role="alert">
              {success}
            </div>
          )}
          {errors.image && !success && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-4" role="alert">
              {errors.image}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Champ Nom */}
            <div className="mb-4">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-pencil-alt mr-2"></i> Nom de la catégorie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.nom ? "border-red-500" : category.nom && /^[a-zA-Z\s-_]+$/.test(category.nom) ? "border-green-500" : "border-gray-200"
                } bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                id="nom"
                name="nom"
                value={category.nom}
                onChange={handleInputChange}
                aria-label="Nom de la catégorie"
                required
              />
              {errors.nom && (
                <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                  {errors.nom}
                </div>
              )}
            </div>

            {/* Champ Image */}
            <div className="mb-4">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-image mr-2"></i> Image de la catégorie <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.image ? "border-red-500" : image ? "border-green-500" : "border-gray-200"
                } bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                id="image"
                onChange={handleImageChange}
                accept="image/*"
                aria-label="Image de la catégorie"
                required
              />
              {errors.image && (
                <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                  {errors.image}
                </div>
              )}
              {image ? (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={category.nom || "Aperçu de l'image"}
                    className="w-48 h-48 object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div >
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Ajouter la catégorie"
              >
                Ajouter la catégorie
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 576px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .w-48 {
            width: 100%;
            max-width: 12rem;
            margin: 0 auto;
          }
          img, .bg-gray-100 {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
          }
          button {
            width: 100%;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AddCategoryPage;