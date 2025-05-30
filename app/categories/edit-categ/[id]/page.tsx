"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/app/components/AdminLayout/page";
import 'bootstrap/dist/css/bootstrap.min.css';

interface Category {
  nom: string;
  image: string;
}

const EditCategoryPage = () => {
  const [category, setCategory] = useState<Category>({ nom: "", image: "" });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState({ nom: "", image: "", general: "" });
  const [touched, setTouched] = useState({ nom: false, image: false });
  const [isValid, setIsValid] = useState({ nom: false, image: false });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategory(response.data);
        setIsValid({
          nom: response.data.nom && /^[a-zA-ZÀ-ÖØ-öø-ÿ\s-_]+$/.test(response.data.nom),
          image: !!response.data.image,
        });
      } catch (error: any) {
        console.error("Erreur lors de la récupération de la catégorie:", {
          message: error.message,
          status: error.response?.status,
          response: error.response?.data,
        });
        setErrors({ nom: "", image: "", general: "Erreur lors de la récupération de la catégorie." });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id, router]);

  const validateNom = (nom: string) => {
    if (!nom.trim()) {
      return { isValid: false, error: "Le nom de la catégorie est obligatoire" };
    }
    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s-_-&]+$/.test(nom)) {
      return { isValid: false, error: "Le nom ne doit contenir que des lettres, espaces, tirets ou underscores" };
    }
    return { isValid: true, error: "" };
  };

  const validateImage = () => {
    if (!category.image && !image) {
      return { isValid: false, error: "L'image de la catégorie est obligatoire" };
    }
    return { isValid: true, error: "" };
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { nom: "", image: "", general: "" };

    const nomValidation = validateNom(category.nom);
    if (!nomValidation.isValid) {
      newErrors.nom = nomValidation.error;
      isValid = false;
    }

    const imageValidation = validateImage();
    if (!imageValidation.isValid) {
      newErrors.image = imageValidation.error;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nom: true, image: true });
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

      for (const [key, value] of formData.entries()) {
        console.log(`FormData: ${key} = ${value}`);
      }

      const response = await axios.post(`http://127.0.0.1:8000/api/categories/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      console.log("Mise à jour réussie:", response.data);
      router.push("/categories");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la catégorie:", {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });
      setErrors({
        nom: "",
        image: "",
        general:
          error.response?.data?.message ||
          "Erreur lors de la mise à jour de la catégorie. Vérifiez les paramètres de la requête.",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategory((prev: Category) => ({
      ...prev,
      [name]: value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "nom") {
      const nomValidation = validateNom(value);
      setIsValid((prev) => ({ ...prev, nom: nomValidation.isValid }));
      setErrors((prev) => ({ ...prev, nom: nomValidation.error, general: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      setTouched((prev) => ({ ...prev, image: true }));
      const imageValidation = validateImage();
      setIsValid((prev) => ({ ...prev, image: true }));
      setErrors((prev) => ({ ...prev, image: "", general: "" }));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-center items-center h-64" role="status">
            <span className="text-sm text-gray-700">Chargement...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Modifier la catégorie
          </h1>

          {errors.general && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-4" role="alert">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la catégorie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.nom ? "border-red-500" : touched.nom && isValid.nom ? "border-green-500" : "border-gray-200"
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

            <div className="mb-4">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image de la catégorie
              </label>
              <input
                type="file"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.image ? "border-red-500" : touched.image && isValid.image ? "border-green-500" : "border-gray-200"
                } bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                id="image"
                onChange={handleImageChange}
                accept="image/*"
                aria-label="Image de la catégorie"
              />
              {errors.image && (
                <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                  {errors.image}
                </div>
              )}
              {(category.image || image) && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">Aperçu de l'image :</p>
                  <img
                    src={image ? URL.createObjectURL(image) : `http://127.0.0.1:8000/storage/${category.image}`}
                    alt={category.nom || "Aperçu de l'image"}
                    className="w-48 h-48 object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              {!category.image && !image && (
                <div className="mt-2 w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg text-sm text-gray-500">
                  Aucune image sélectionnée
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => router.push("/categories")}
                aria-label="Annuler"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Sauvegarder les modifications"
              >
                Sauvegarder les modifications
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

export default EditCategoryPage;