"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import NavbarProps from "../../components/NavbarProps/page";
import { FaImage, FaSpinner } from "react-icons/fa";

interface Offre {
  id: number;
  titre: string;
  description: string;
  prix_initial: number;
  prix_reduit: number;
  reduction: number;
  date_debut: string;
  date_fin: string;
  quantite_initial: number;
  image?: string;
  image_url?: string;
  entite: {
    nom_entites: string;
    localisation: string;
  };
}

const OfferDetails = () => {
  const [offre, setOffre] = useState<Offre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }
        const response = await axios.get(`http://127.0.0.1:8000/api/offres/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Offer data:", response.data);
        setOffre(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des détails de l'offre:", err);
        setError("Impossible de charger les détails de l'offre. Veuillez réessayer.");
        setLoading(false);
      }
    };

    if (id) {
      fetchOfferDetails();
    } else {
      setError("ID de l'offre non fourni");
      setLoading(false);
    }
  }, [id]);

  // Determine image source
  const imageSrc = offre?.image
    ? `http://127.0.0.1:8000/storage/${offre.image}`
    : offre?.image_url
    ? `http://127.0.0.1:8000${offre.image_url}`
    : "/default-image.png";

  if (loading) {
    return (
      <NavbarProps>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-center items-center h-64">
            <FaSpinner className="text-2xl text-blue-500 animate-spin" />
            <span className="ml-3 text-sm text-gray-700">Chargement en cours...</span>
          </div>
        </div>
      </NavbarProps>
    );
  }

  if (error || !offre) {
    return (
      <NavbarProps>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm shadow-sm" role="alert">
            <h2 className="text-base font-semibold">Erreur</h2>
            <p className="mt-1">{error || "Offre non trouvée"}</p>
          </div>
        </div>
      </NavbarProps>
    );
  }

  return (
    <NavbarProps>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">{offre.titre}</h1>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image Section */}
            <div className="flex-shrink-0 w-full md:w-48">
              <div className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <img
                  src={imageSrc}
                  alt={offre.titre}
                  className="w-48 h-48 rounded-lg object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = "0";
                    const placeholder = document.getElementById(`placeholder-${offre.id}`);
                    if (placeholder) placeholder.classList.remove("hidden");
                  }}
                  aria-label={`Image de l'offre ${offre.titre}`}
                />
                <div
                  id={`placeholder-${offre.id}`}
                  className="absolute inset-0 hidden flex items-center justify-center bg-gray-100 rounded-lg"
                >
                  <FaImage className="text-xl text-gray-500" />
                  <span className="ml-1 text-sm text-gray-500">Indisponible</span>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1">
              <div className="space-y-4 text-gray-700">
                <p className="text-sm text-gray-700 leading-relaxed">{offre.description || "Aucune description disponible"}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Prix initial :</span> {offre.prix_initial} Dt
                    </p>
                    {offre.reduction > 0 && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Réduction :</span> {offre.reduction}%
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Prix réduit :</span> {offre.prix_reduit} Dt
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Quantité disponible :</span> {offre.quantite_initial}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Prestataire :</span> {offre.entite.nom_entites}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Localisation :</span> {offre.entite.localisation}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Date de début :</span>{" "}
                      {new Date(offre.date_debut).toLocaleDateString("fr-TN") || "Non spécifiée"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Date de fin :</span>{" "}
                      {new Date(offre.date_fin).toLocaleDateString("fr-TN") || "Non spécifiée"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
          .w-48 {
            width: 100%;
            max-width: 12rem;
            margin: 0 auto;
          }
          img {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
          }
        }
      `}</style>
    </NavbarProps>
  );
};

export default OfferDetails;