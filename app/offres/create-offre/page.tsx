"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import NavbarProps from "@/app/components/NavbarProps/page";

type Entite = {
  id: number;
  nom_entites: string;
  status: string;
};

const AjouterOffre = () => {
  const [entites, setEntites] = useState<Entite[]>([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [prixInitial, setPrixInitial] = useState("");
  const [reduction, setReduction] = useState("");
  const [prixReduit, setPrixReduit] = useState("");
  const [quantite, setQuantite] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const [errors, setErrors] = useState<{
    titre?: string;
    description?: string;
    prixInitial?: string;
    reduction?: string;
    quantite?: string;
    dateDebut?: string;
    dateFin?: string;
  }>({});

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setError("Vous devez être connecté pour ajouter une offre.");
    } else {
      setToken(storedToken);
      fetchEntites(storedToken);
    }
  }, []);

  useEffect(() => {
    const initial = parseFloat(prixInitial);
    const reduc = parseFloat(reduction) || 0;
    if (!isNaN(initial) && initial >= 0) {
      const calculatedPrice = initial * (1 - reduc / 100);
      setPrixReduit(calculatedPrice.toFixed(2));
    } else {
      setPrixReduit("");
    }
  }, [prixInitial, reduction]);

  const fetchEntites = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:8000/api/entites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const entitesAcceptees = response.data.filter(
        (entite: Entite) => entite.status === "accepté"
      );

      setEntites(entitesAcceptees);
    } catch {
      setError("Erreur lors du chargement des entités.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!titre.trim()) newErrors.titre = "Le titre est obligatoire.";

    if (description.length > 225)
      newErrors.description = "La description ne doit pas dépasser 225 caractères.";

    if (!prixInitial) newErrors.prixInitial = "Le prix initial est obligatoire.";
    else if (isNaN(Number(prixInitial)) || Number(prixInitial) <= 0)
      newErrors.prixInitial = "Le prix initial doit être un nombre positif.";

    if (reduction && (isNaN(Number(reduction)) || Number(reduction) < 0 || Number(reduction) > 100))
      newErrors.reduction = "La réduction doit être un nombre entre 0 et 100.";

    if (!quantite) newErrors.quantite = "La quantité est obligatoire.";
    else if (isNaN(Number(quantite)) || Number(quantite) < 1)
      newErrors.quantite = "La quantité doit être un entier supérieur ou égal à 1.";

    if (!dateDebut) {
      newErrors.dateDebut = "La date de début est obligatoire.";
    } else {
      const dateDebutObj = new Date(dateDebut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateDebutObj < today) {
        newErrors.dateDebut = "La date de début ne peut pas être dans le passé.";
      }
    }

    if (!dateFin) {
      newErrors.dateFin = "La date de fin est obligatoire.";
    } else if (dateDebut) {
      const dateDebutObj = new Date(dateDebut);
      const dateFinObj = new Date(dateFin);
      if (dateFinObj < dateDebutObj) {
        newErrors.dateFin = "La date de fin doit être après la date de début.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!validate()) return;

    setLoading(true);

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

    try {
      const formData = new FormData();
      formData.append("entite_id", entites[0].id.toString());
      formData.append("titre", titre);
      formData.append("description", description);
      formData.append("prix_initial", prixInitial);
      formData.append("reduction", reduction || "0");
      formData.append("quantite", quantite);
      formData.append("date_debut", dateDebut);
      formData.append("date_fin", dateFin);
      if (image) formData.append("image", image);

      await axios.post("http://localhost:8000/api/offres", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Offre ajoutée avec succès !");
      setTitre("");
      setDescription("");
      setPrixInitial("");
      setReduction("");
      setPrixReduit("");
      setQuantite("");
      setDateDebut("");
      setDateFin("");
      setImage(null);

      setTimeout(() => router.push("/offres"), 2000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(JSON.stringify(err.response.data.errors));
      } else {
        setError("Erreur lors de l'ajout de l'offre.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <NavbarProps>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Ajouter une Offre</h2>
          {message && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm mb-4" role="alert">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-4" role="alert">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            encType="multipart/form-data"
            noValidate
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Entité</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={entites[0]?.nom_entites || "Aucune entité disponible"}
                readOnly
                aria-label="Nom de l'entité"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-lg border ${errors.titre ? "border-red-500" : titre ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
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
                className={`w-full px-3 py-2 rounded-lg border ${errors.description ? "border-red-500" : description ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={225}
                aria-label="Description de l'offre"
              />
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
                className={`w-full px-3 py-2 rounded-lg border ${errors.prixInitial ? "border-red-500" : prixInitial ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                value={prixInitial}
                onChange={(e) => setPrixInitial(e.target.value)}
                min="0"
                step="0.01"
                aria-label="Prix initial de l'offre"
              />
              {errors.prixInitial && (
                <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                  {errors.prixInitial}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Réduction (%)</label>
              <input
                type="number"
                className={`w-full px-3 py-2 rounded-lg border ${errors.reduction ? "border-red-500" : reduction ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                value={reduction}
                onChange={(e) => setReduction(e.target.value)}
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
                value={prixReduit}
                readOnly
                placeholder="Calculé automatiquement"
                aria-label="Prix réduit de l'offre"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
              <input
                type="number"
                className={`w-full px-3 py-2 rounded-lg border ${errors.quantite ? "border-red-500" : quantite ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Initiale</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={quantite}
                readOnly
                placeholder="Égale à la quantité"
                aria-label="Quantité initiale de l'offre"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de Début *</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.dateDebut ? "border-red-500" : dateDebut ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  aria-label="Date de début de l'offre"
                />
                {errors.dateDebut && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                    {errors.dateDebut}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de Fin *</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.dateFin ? "border-red-500" : dateFin ? "border-green-500" : "border-gray-200"} bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  min={dateDebut || new Date().toISOString().split("T")[0]}
                  aria-label="Date de fin de l'offre"
                />
                {errors.dateFin && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mt-1">
                    {errors.dateFin}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                accept="image/*"
                onChange={handleImageChange}
                aria-label="Télécharger une image pour l'offre"
              />
              {image && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Aperçu de l'image"
                    className="w-48 h-48 object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={loading}
                aria-label="Ajouter l'offre"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    Chargement...
                  </div>
                ) : (
                  "Ajouter l'Offre"
                )}
              </button>
            </div>
          </form>
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
          button {
            width: 100%;
          }
        }
      `}</style>
    </NavbarProps>
  );
};

export default AjouterOffre;