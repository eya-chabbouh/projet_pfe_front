"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Entite = {
  id: number;
  nom_entites: string;
  status: string;
};

const AjouterOffre = () => {
  const [entites, setEntites] = useState<Entite[]>([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [prixReduit, setPrixReduit] = useState("");
  const [reduction, setReduction] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setError("Vous devez être connecté pour ajouter une offre.");
    } else {
      setToken(storedToken);
      fetchEntites(storedToken);
    }
  }, []);

  const fetchEntites = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:8000/api/entites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const entitesAcceptees = response.data.filter(
        (entite: Entite) => entite.status === "accepté"
      );

      setEntites(entitesAcceptees);
    } catch (err) {
      setError("Erreur lors du chargement des entités.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Authentification requise.");
      setLoading(false);
      return;
    }

    if (entites.length === 0) {
      setError("Aucune entité disponible pour l’ajout.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("entite_id", entites[0].id.toString());
    formData.append("titre", titre);
    formData.append("description", description);
    formData.append("prix_reduit", prixReduit);
    formData.append("reduction", reduction);
    formData.append("date_debut", dateDebut);
    formData.append("date_fin", dateFin);

    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.post("http://localhost:8000/api/offres", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Offre ajoutée avec succès !");
      setTitre("");
      setDescription("");
      setPrixReduit("");
      setReduction("");
      setDateDebut("");
      setDateFin("");
      setImage(null);

      setTimeout(() => {
        router.push("/offres");
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data.errors));
      } else {
        setError("Erreur lors de l'ajout de l'offre.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Ajouter une Offre</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="card p-4 shadow-lg border-light"
        encType="multipart/form-data"
      >
        <div className="mb-3">
          <label className="form-label">Entité</label>
          <input
            type="text"
            className="form-control"
            value={entites[0]?.nom_entites || "Aucune entité disponible"}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Titre</label>
          <input
            type="text"
            className="form-control"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Prix Réduit</label>
          <input
            type="number"
            className="form-control"
            value={prixReduit}
            onChange={(e) => setPrixReduit(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Réduction (%)</label>
          <input
            type="number"
            className="form-control"
            value={reduction}
            onChange={(e) => setReduction(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date de Début</label>
          <input
            type="date"
            className="form-control"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date de Fin</label>
          <input
            type="date"
            className="form-control"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Chargement..." : "Ajouter l'Offre"}
        </button>
      </form>
    </div>
  );
};

export default AjouterOffre;
