"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import NavbarProps from "@/app/components/NavbarProps/page";

const EditOffrePage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [offre, setOffre] = useState({
    entite_id: "",
    titre: "",
    description: "",
    prix_initial: "",
    prix_reduit: "",
    reduction: "",
    quantite: "",
    date_debut: "",
    date_fin: "",
    image: "" as string | File,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entite, setEntite] = useState<{ id: string; nom_entites: string } | null>(null);
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
          prix_initial: response.data.prix_initial || "",
          prix_reduit: response.data.prix_reduit || "",
          reduction: response.data.reduction || "",
          quantite: response.data.quantite || "",
          date_debut: response.data.date_debut || "",
          date_fin: response.data.date_fin || "",
          image: response.data.image || "",
        });

        const entiteResponse = await axios.get(
          `http://127.0.0.1:8000/api/entites/${response.data.entite_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setEntite(entiteResponse.data);
        setLoading(false);
      } catch {
        setError("Erreur lors du chargement de l'offre");
        setLoading(false);
      }
    };

    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      if (id) fetchOffre(storedToken);
    } else {
      setError("Token manquant ou invalide");
    }
  }, [id]);

  useEffect(() => {
    const initial = parseFloat(offre.prix_initial);
    const reduc = parseFloat(offre.reduction) || 0;
    if (!isNaN(initial) && initial >= 0) {
      const calculatedPrice = initial * (1 - reduc / 100);
      setOffre((prev) => ({ ...prev, prix_reduit: calculatedPrice.toFixed(2) }));
    } else {
      setOffre((prev) => ({ ...prev, prix_reduit: "" }));
    }
  }, [offre.prix_initial, offre.reduction]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOffre({
      ...offre,
      [name]: name === "quantite" ? (value ? parseInt(value) : "") : value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOffre({ ...offre, image: e.target.files[0] });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!offre.titre.trim()) newErrors.titre = "Le titre est obligatoire.";
    if (offre.description.length > 225)
      newErrors.description = "La description ne doit pas dépasser 225 caractères.";
    if (!offre.prix_initial || isNaN(Number(offre.prix_initial)) || Number(offre.prix_initial) <= 0)
      newErrors.prix_initial = "Le prix initial doit être un nombre positif.";
    if (offre.reduction && (isNaN(Number(offre.reduction)) || Number(offre.reduction) < 0 || Number(offre.reduction) > 100))
      newErrors.reduction = "La réduction doit être un nombre entre 0 et 100.";
    if (!offre.quantite || isNaN(Number(offre.quantite)) || Number(offre.quantite) < 1)
      newErrors.quantite = "La quantité doit être un entier supérieur ou égal à 1.";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateDebut = new Date(offre.date_debut);
    const dateFin = new Date(offre.date_fin);
    if (!offre.date_debut) {
      newErrors.date_debut = "La date de début est obligatoire.";
    } else if (dateDebut < today) {
      newErrors.date_debut = "La date de début ne peut pas être dans le passé.";
    }
    if (!offre.date_fin) {
      newErrors.date_fin = "La date de fin est obligatoire.";
    } else if (dateFin < dateDebut) {
      newErrors.date_fin = "La date de fin doit être après la date de début.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) return setError("Token manquant ou invalide");

    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("entite_id", offre.entite_id);
      formData.append("titre", offre.titre);
      formData.append("description", offre.description);
      formData.append("prix_initial", offre.prix_initial);
      formData.append("reduction", offre.reduction || "0");
      formData.append("quantite", offre.quantite.toString());
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'offre");
    }
  };

  if (loading) {
    return (
      <NavbarProps>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm text-gray-700">Chargement...</span>
          </div>
        </div>
      </NavbarProps>
    );
  }

  if (error) {
    return (
      <NavbarProps>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm" role="alert">
            {error}
          </div>
        </div>
      </NavbarProps>
    );
  }

  return (
    <NavbarProps>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Modifier Offre</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Entité</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={entite?.nom_entites || "Chargement..."}
                  readOnly
                  aria-label="Nom de l'entité"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  name="titre"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.titre ? "border-red-500" : offre.titre ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  value={offre.titre}
                  onChange={handleChange}
                  required
                  aria-label="Titre de l'offre"
                />
                {errors.titre && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                    {errors.titre}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.description ? "border-red-500" : offre.description ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  value={offre.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={225}
                  aria-label="Description de l'offre"
                ></textarea>
                {errors.description && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                    {errors.description}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix Initial (TND) *</label>
                <input
                  type="number"
                  name="prix_initial"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.prix_initial ? "border-red-500" : offre.prix_initial ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  value={offre.prix_initial}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  aria-label="Prix initial de l'offre"
                />
                {errors.prix_initial && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                    {errors.prix_initial}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Réduction (%)</label>
                <input
                  type="number"
                  name="reduction"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.reduction ? "border-red-500" : offre.reduction ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  value={offre.reduction}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  aria-label="Réduction en pourcentage"
                />
                {errors.reduction && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                    {errors.reduction}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix Réduit (TND)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={offre.prix_reduit}
                  readOnly
                  placeholder="Calculé automatiquement"
                  aria-label="Prix réduit de l'offre"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                <input
                  type="number"
                  name="quantite"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.quantite ? "border-red-500" : offre.quantite ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  value={offre.quantite}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  aria-label="Quantité de l'offre"
                />
                {errors.quantite && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                    {errors.quantite}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de Début *</label>
                  <input
                    type="date"
                    name="date_debut"
                    className={`w-full px-3 py-2 rounded-lg border ${errors.date_debut ? "border-red-500" : offre.date_debut ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                    value={offre.date_debut}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    aria-label="Date de début de l'offre"
                  />
                  {errors.date_debut && (
                    <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                      {errors.date_debut}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de Fin *</label>
                  <input
                    type="date"
                    name="date_fin"
                    className={`w-full px-3 py-2 rounded-lg border ${errors.date_fin ? "border-red-500" : offre.date_fin ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                    value={offre.date_fin}
                    onChange={handleChange}
                    min={offre.date_debut || new Date().toISOString().split("T")[0]}
                    aria-label="Date de fin de l'offre"
                  />
                  {errors.date_fin && (
                    <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                      {errors.date_fin}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onChange={handleFileChange}
                  accept="image/*"
                  aria-label="Télécharger une image pour l'offre"
                />
                {typeof offre.image === "string" && offre.image && (
                  <div className="mt-2">
                    <img
                      src={`http://127.0.0.1:8000/storage/${offre.image}`}
                      alt="Image actuelle"
                      className="w-48 h-48 object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Enregistrer les modifications"
                >
                  Enregistrer
                </button>
                <Link
                  href="/offres"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors duration-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Annuler et revenir à la liste des offres"
                >
                  Annuler
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 576px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .grid.sm\\:grid-cols-2 {
            grid-template-columns: 1fr;
          }
          .flex.sm\\:flex-row {
            flex-direction: column;
          }
          button,
          a {
            width: 100%;
          }
        }
      `}</style>
    </NavbarProps>
  );
};

export default EditOffrePage;