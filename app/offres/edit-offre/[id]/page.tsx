"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const EditOffrePage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [offre, setOffre] = useState({
    entite_id: "",
    titre: "",
    description: "",
    prix_reduit: 0,
    reduction: 0,
    date_debut: "",
    date_fin: "",
    image: "" as string | File,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entite, setEntite] = useState<{ id: string; nom_entites: string } | null>(null); // Etat pour l'entité de l'offre
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffre = async (token: string) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/offres/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOffre({
          entite_id: response.data.entite_id,
          titre: response.data.titre,
          description: response.data.description || "",
          prix_reduit: parseFloat(response.data.prix_reduit),
          reduction: response.data.reduction || 0,
          date_debut: response.data.date_debut || "",
          date_fin: response.data.date_fin || "",
          image: response.data.image || "",
        });

        // Récupération de l'entité associée à l'offre
        const entiteResponse = await axios.get(`http://127.0.0.1:8000/api/entites/${response.data.entite_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setEntite(entiteResponse.data);

        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement de l'offre");
        setLoading(false);
      }
    };

    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      if (id) {
        fetchOffre(storedToken);
      }
    } else {
      setError("Token manquant ou invalide");
    }
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOffre({ ...offre, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOffre({ ...offre, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token manquant ou invalide");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("entite_id", offre.entite_id);
      formData.append("titre", offre.titre);
      formData.append("description", offre.description);
      formData.append("prix_reduit", parseFloat(offre.prix_reduit.toString()).toString());
      formData.append("reduction", offre.reduction.toString());
      formData.append("date_debut", offre.date_debut);
      formData.append("date_fin", offre.date_fin);

      if (offre.image && typeof offre.image !== "string") {
        formData.append("image", offre.image);
      }

      await axios.post(`http://127.0.0.1:8000/api/offres/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/offres");
    } catch (error) {
      setError("Erreur lors de la mise à jour de l'offre");
    }
  };

  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="display-4 text-center mb-4">Modifier l'Offre</h1>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Affichage de l'entité associée */}
            <div className="mb-3">
              <label className="form-label">Entité</label>
              {/* Afficher uniquement le nom de l'entité liée à l'offre */}
              <input
                type="text"
                className="form-control"
                value={entite ? entite.nom_entites : "Chargement..."}
                readOnly
              />
            </div>

            {/* Titre */}
            <div className="mb-3">
              <label className="form-label">Titre</label>
              <input
                type="text"
                name="titre"
                className="form-control"
                value={offre.titre}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                value={offre.description}
                onChange={handleChange}
                rows={4}
                required
              ></textarea>
            </div>

            {/* Prix Réduit */}
            <div className="mb-3">
              <label className="form-label">Prix Réduit (€)</label>
              <input
                type="number"
                name="prix_reduit"
                className="form-control"
                value={offre.prix_reduit}
                onChange={handleChange}
                required
              />
            </div>

            {/* Réduction */}
            <div className="mb-3">
              <label className="form-label">Réduction (%)</label>
              <input
                type="number"
                name="reduction"
                className="form-control"
                value={offre.reduction}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>

            {/* Dates */}
            <div className="row">
              <div className="mb-3 col">
                <label className="form-label">Date de Début</label>
                <input
                  type="date"
                  name="date_debut"
                  className="form-control"
                  value={offre.date_debut}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3 col">
                <label className="form-label">Date de Fin</label>
                <input
                  type="date"
                  name="date_fin"
                  className="form-control"
                  value={offre.date_fin}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Image */}
            <div className="mb-3">
              <label className="form-label">Image</label>
              <input type="file" className="form-control" onChange={handleFileChange} />
              {typeof offre.image === "string" && offre.image && (
                <div className="mt-2">
                  <img
                    src={`http://127.0.0.1:8000/storage/${offre.image}`}
                    alt="Aperçu de l'image"
                    className="img-thumbnail"
                    style={{ maxWidth: "200px" }}
                  />
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
              <Link href="/offres" className="btn btn-secondary">
                Annuler
              </Link>
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => router.back()}
              >
                Retour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOffrePage;
