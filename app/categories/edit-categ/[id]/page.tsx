"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

// Définition du type pour la catégorie
interface Category {
  nom: string;
  image: string;
}

const EditCategoryPage = () => {
  const [category, setCategory] = useState<Category>({ nom: "", image: "" });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams(); // Récupère l'ID de la catégorie depuis l'URL

  // Récupérer les détails de la catégorie au chargement de la page
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login"); // Redirection si non connecté
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategory(response.data); // Mettre à jour les données de la catégorie
      } catch (error) {
        console.error("Erreur lors de la récupération de la catégorie", error);
        setError("Erreur lors de la récupération de la catégorie.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory(); // Récupérer la catégorie seulement si l'ID est défini
    }
  }, [id, router]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nom", category.nom);
      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login"); // Redirection si non connecté
        return;
      }

      await axios.post(`http://127.0.0.1:8000/api/categories/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Redirection après modification
      router.push("/categories");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la catégorie", error);
      setError("Erreur lors de la mise à jour de la catégorie.");
    }
  };

  // Gérer les modifications des champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategory((prev: Category) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h1 className="my-4 text-center text-primary">Modifier la catégorie</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Nom de la catégorie */}
          <div className="form-group mb-3">
            <label htmlFor="nom" className="form-label">
              <i className="fas fa-pencil-alt"></i> Nom de la catégorie
            </label>
            <input
              type="text"
              className="form-control"
              id="nom"
              name="nom"
              value={category.nom}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Image de la catégorie */}
          <div className="form-group mb-3">
            <label htmlFor="image" className="form-label">
              <i className="fas fa-image"></i> Image de la catégorie
            </label>
            <input
              type="file"
              className="form-control"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
            />
            {category.image && (
              <div className="mt-2">
                <img
                  src={`http://127.0.0.1:8000/storage/${category.image}`}
                  alt={category.nom}
                  style={{ width: "150px", height: "150px", borderRadius: "10px" }}
                  className="img-fluid"
                />
              </div>
            )}
          </div>

          {/* Button Submit */}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">
              Sauvegarder les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryPage;
