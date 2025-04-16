"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const EditEntitesPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [nomEntite, setNomEntite] = useState("");
  const [description, setDescription] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [categId, setCategId] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les données de l'entité et les options de catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token non disponible");

        const [entiteRes, categoriesRes] = await Promise.all([
          fetch(`http://localhost:8000/api/entites/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://127.0.0.1:8000/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!entiteRes.ok || !categoriesRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const entiteData = await entiteRes.json();
        const categoriesData = await categoriesRes.json();

        setNomEntite(entiteData.nom_entites);
        setDescription(entiteData.description);
        setLocalisation(entiteData.localisation);
        setCategId(entiteData.categ_id);
        setCategories(categoriesData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Soumettre le formulaire de mise à jour
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedEntite = new FormData();
    updatedEntite.append("nom_entites", nomEntite);
    updatedEntite.append("description", description);
    updatedEntite.append("localisation", localisation);
    if (categId !== "") updatedEntite.append("categ_id", String(categId));
    if (image) updatedEntite.append("image", image);

    // Ajout du champ _method=PUT pour Laravel
    updatedEntite.append("_method", "PUT");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/entites/${id}`, {
        method: "post", // Laravel ne supporte pas PUT avec FormData
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: updatedEntite,
      });

      if (!res.ok) {
        let errorMessage = "Erreur lors de la mise à jour de l'entité";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (_) {
          // réponse non JSON, on garde le message par défaut
        }
        throw new Error(errorMessage);
      }

      setSuccessMessage("Entité mise à jour avec succès !");
      setTimeout(() => {
        router.push("/entites");
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary mb-5">Modifier l'Entité</h1>
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-light p-4 rounded-lg shadow-lg"
        encType="multipart/form-data"
      >
        {/* Nom de l'entité */}
        <div className="form-group mb-3">
          <label htmlFor="nom_entites" className="font-weight-bold text-secondary">
            Nom de l'entité
          </label>
          <input
            type="text"
            className="form-control"
            id="nom_entites"
            value={nomEntite}
            onChange={(e) => setNomEntite(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="form-group mb-3">
          <label htmlFor="description" className="font-weight-bold text-secondary">
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Localisation */}
        <div className="form-group mb-3">
          <label htmlFor="localisation" className="font-weight-bold text-secondary">
            Localisation
          </label>
          <input
            type="text"
            className="form-control"
            id="localisation"
            value={localisation}
            onChange={(e) => setLocalisation(e.target.value)}
            required
          />
        </div>

        {/* Catégorie */}
        <div className="form-group mb-3">
          <label htmlFor="categorie" className="font-weight-bold text-secondary">
            Catégorie
          </label>
          <input
            type="text"
            className="form-control"
            id="categorie"
            value={categories.find((cat) => cat.id === categId)?.nom || "Catégorie inconnue"}
            readOnly
          />
        </div>

        {/* Image */}
        <div className="form-group mb-3">
          <label htmlFor="image" className="font-weight-bold text-secondary">
            Image
          </label>
          <input
            type="file"
            className="form-control"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Mettre à jour
        </button>
      </form>
    </div>
  );
};

export default EditEntitesPage;
