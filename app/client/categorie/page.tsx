"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

interface Category {
  id: number;
  nom: string;
  image: string;
}

export default function EditCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchCategories = async () => {
    try {
      const categoriesRes = await axios.get("http://127.0.0.1:8000/api/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      }

      const selectedRes = await axios.get("http://127.0.0.1:8000/api/client/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (Array.isArray(selectedRes.data)) {
        setSelectedCategories(selectedRes.data.map((cat: Category) => cat.id));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories :", error);
      setError("Erreur lors du chargement des catégories.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    setMessage(null);
    setError(null);

    if (selectedCategories.length === 0) {
      setError("Veuillez sélectionner au moins une catégorie.");
      return;
    }

    try {
      await axios.put(
        "http://127.0.0.1:8000/api/client/categories/update",
        { categories: selectedCategories },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setMessage("✅ Mise à jour réussie !");
      fetchCategories();

      setTimeout(() => {
        router.push("/client");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="container py-5">
      <Link href="/client" className="btn btn-outline-primary mb-3">
        ← Retour
      </Link>

      <h1 className="text-center mb-4">Modifier mes catégories</h1>

      {/* Affichage des messages */}
      {message && (
        <div className="alert alert-success text-center" role="alert">
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <div className="col-6 col-md-4 col-lg-3 mb-4" key={category.id}>
              <div
                className={`card h-100 border ${
                  isSelected ? "border-primary bg-light" : ""
                }`}
              >
                <img
                  src={`http://127.0.0.1:8000/storage/${category.image}`}
                  className="card-img-top rounded"
                  alt={category.nom}
                  style={{ height: "150px", objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <h5 className="card-title">{category.nom}</h5>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="form-check-input mt-2"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn btn-primary w-100 mt-4" onClick={handleSubmit}>
        Confirmer
      </button>
    </div>
  );
}
