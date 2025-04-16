"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Définition du type pour une catégorie
interface Category {
  nom: string;
  image: string;
}

const AddCategoryPage = () => {
  const [category, setCategory] = useState<Category>({ nom: "", image: "" });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  // Gestion de la soumission du formulaire
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
        router.push("/login"); // Redirige si non connecté
        return;
      }

      // Envoi de la requête POST pour ajouter une nouvelle catégorie
      await axios.post("http://127.0.0.1:8000/api/categories", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Affichage du message de succès et réinitialisation du formulaire
      setSuccess("Catégorie ajoutée avec succès !");
      setCategory({ nom: "", image: "" });
      setImage(null);
      setTimeout(() => {
        router.push("/categories"); // Redirection après 2 secondes
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie", error);
      setError("Une erreur est survenue lors de l'ajout de la catégorie.");
    }
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategory((prev: Category) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion du changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h1 className="my-4 text-center text-primary">Ajouter une nouvelle catégorie</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

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
            {image && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt={category.nom}
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
                  className="img-fluid"
                />
              </div>
            )}
          </div>

          {/* Button Submit */}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary mt-3">
              Ajouter la catégorie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryPage;
