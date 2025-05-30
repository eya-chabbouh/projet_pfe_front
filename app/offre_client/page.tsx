"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Star, X, User, ShoppingCart, Eye, MessageSquare, Filter, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "../components/Navbar";

interface Offer {
  id: number;
  titre: string;
  description: string;
  prix_initial: number;
  prix_reduit: number;
  date_debut: Date;
  date_fin: Date;
  reduction: number;
  image_url?: string;
  quantite: number;
}

interface Entity {
  id: number;
  nom_entites: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  user: {
    id: number;
    name: string;
    profile_image?: string;
  };
}

export default function OffreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [filter, setFilter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | React.ReactNode>("");
  const [reviews, setReviews] = useState<Record<number, Review[]>>({});
  const [newReview, setNewReview] = useState<Record<number, Review>>({});
  const [isReviewOpen, setIsReviewOpen] = useState<Record<number, boolean>>({});
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [isReviewsVisible, setIsReviewsVisible] = useState<Record<number, boolean>>({});
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  const entityId = searchParams?.get("id");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchOffers = async () => {
      if (!entityId) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setModalMessage("Veuillez vous connecter pour voir les offres.");
          setShowErrorModal(true);
          setIsLoading(false);
          return;
        }

        const offerResponse = await axios.get<Offer[]>(`${API_BASE_URL}/api/offres/entite/${entityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const entityResponse = await axios.get<Entity>(`${API_BASE_URL}/api/entites/${entityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOffers(offerResponse.data);
        setFilteredOffers(offerResponse.data);
        setEntity(entityResponse.data);
        setIsLoading(false);

        const initialQuantities: Record<number, number> = {};
        offerResponse.data.forEach((offer) => {
          initialQuantities[offer.id] = 1;
        });
        setSelectedQuantities(initialQuantities);

        const reviewsData: Record<number, Review[]> = {};
        for (const offer of offerResponse.data) {
          const res = await axios.get<Review[]>(`${API_BASE_URL}/api/offres/${offer.id}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          reviewsData[offer.id] = res.data;
        }
        setReviews(reviewsData);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setModalMessage("Erreur lors du chargement des offres.");
        setShowErrorModal(true);
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [entityId]);

  const handleQuantityChange = (offerId: number, change: number) => {
    setSelectedQuantities((prev) => {
      const currentQuantity = prev[offerId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change);
      const offer = offers.find((o) => o.id === offerId);
      if (offer && newQuantity > offer.quantite) {
        setModalMessage("Quantité sélectionnée dépasse les places disponibles.");
        setShowWarningModal(true);
        return prev;
      }
      return { ...prev, [offerId]: newQuantity };
    });
  };

  const handleAjouterAuPanier = async (offer: Offer) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalMessage("Veuillez vous connecter.");
      setShowWarningModal(true);
      return;
    }

    const selectedQuantity = selectedQuantities[offer.id] || 1;

    if (selectedQuantity > offer.quantite) {
      setModalMessage("Quantité sélectionnée dépasse les places disponibles.");
      setShowWarningModal(true);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/panier/ajouter`,
        {
          offre_id: offer.id,
          quantite: selectedQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCartUpdateTrigger((prev) => prev + 1);

      setModalMessage(
        <span className="flex items-center">
          Offre ajoutée !{" "}
          <Link href="/panier" className="underline text-purple-600 hover:text-purple-800 ml-1">
            Voir le panier
          </Link>
        </span>
      );
      setShowSuccessModal(true);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setModalMessage(
          <span className="flex items-center">
            Déjà dans le panier.{" "}
            <Link href="/panier" className="underline text-purple-600 hover:text-purple-800 ml-1">
              Voir le panier
            </Link>
          </span>
        );
        setShowWarningModal(true);
      } else if (error.response?.status === 422) {
        setModalMessage("Quantité dépasse les places disponibles.");
        setShowWarningModal(true);
      } else {
        setModalMessage("Erreur lors de l'ajout au panier.");
        setShowErrorModal(true);
        console.error("Erreur:", error);
      }
    }
  };

  const isExpired = (dateFin: Date) => new Date(dateFin) < new Date();

  const applyFilter = (value: number | null) => {
    setFilter(value);
    if (value !== null) {
      const filtered = offers.filter((offer) => offer.prix_reduit <= value);
      setFilteredOffers(filtered);
    } else {
      setFilteredOffers(offers);
    }
  };

  const handleReviewSubmit = async (offerId: number) => {
    if (!newReview[offerId]?.rating || !newReview[offerId]?.comment) {
      setModalMessage("Veuillez remplir tous les champs.");
      setShowWarningModal(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setModalMessage("Veuillez vous connecter pour soumettre un avis.");
        setShowWarningModal(true);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/offres/${offerId}/reviews`,
        newReview[offerId],
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews((prevReviews) => {
        const updated = { ...prevReviews };
        if (!updated[offerId]) updated[offerId] = [];
        updated[offerId].push(response.data);
        return updated;
      });

      setNewReview((prevNewReview) => ({
        ...prevNewReview,
        [offerId]: { id: 0, rating: 0, comment: "", user: { id: 0, name: "" } },
      }));

      setModalMessage("Avis soumis avec succès.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erreur lors de la soumission de l'avis:", error);
      setModalMessage("Erreur lors de la soumission de l'avis.");
      setShowErrorModal(true);
    }
  };

  const calculateAverageRating = (offerId: number) => {
    const offerReviews = reviews[offerId];
    if (!offerReviews || offerReviews.length === 0) return 0;
    const total = offerReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / offerReviews.length;
  };

  const toggleReviewForm = (offerId: number) => {
    setIsReviewOpen((prev) => ({ ...prev, [offerId]: !prev[offerId] }));
    if (!newReview[offerId]) {
      setNewReview((prev) => ({
        ...prev,
        [offerId]: { id: 0, rating: 0, comment: "", user: { id: 0, name: "" } },
      }));
    }
  };

  const toggleReviewsVisibility = (offerId: number) => {
    setIsReviewsVisible((prev) => ({ ...prev, [offerId]: !prev[offerId] }));
  };

  return (
    <>
      <Navbar onCartUpdate={() => setCartUpdateTrigger((prev) => prev + 1)} />
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Offres de {entity?.nom_entites || "Chargement..."}
                </h1>
                <p className="text-gray-600 text-sm">Découvrez les meilleures offres disponibles</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 text-sm">Chargement...</span>
              </div>
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((offer) => {
                const avgRating = calculateAverageRating(offer.id);
                const totalReviews = reviews[offer.id]?.length || 0;
                const isOutOfStock = offer.quantite === 0;
                const selectedQuantity = selectedQuantities[offer.id] || 1;
                const isPopular = totalReviews > 5;
                const isLowStock = offer.quantite > 0 && offer.quantite < 5;

                return (
                  <div
                    key={offer.id}
                    className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 transition-shadow duration-300 hover:shadow-lg ${
                      isOutOfStock ? "opacity-75" : ""
                    }`}
                  >
                    <div className="relative w-full h-48">
                      {offer.image_url ? (
                        <img
                          src={offer.image_url}
                          alt={offer.titre}
                          className="w-full h-full object-cover rounded-t-xl"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-t-xl">
                          <span className="text-gray-400 text-sm">Pas d'image</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                        -{offer.reduction}%
                      </div>
                      {isPopular && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-medium px-2 py-1 rounded-md">
                          Populaire
                        </div>
                      )}
                    
                      {isOutOfStock && (
                        <div className="absolute top-10 right-2 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded-md">
                          Épuisé
                        </div>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <div className="absolute top-10 right-2 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                          Stock faible
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-gray-800">{offer.titre}</h3>
                      <p className="text-gray-600 text-xs line-clamp-2">{offer.description}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}
                            fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                            aria-hidden="true"
                          />
                        ))}
                        <span className="ml-1.5 text-xs text-gray-600">
                          {avgRating.toFixed(1)} ({totalReviews})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline space-x-1.5">
                          <p className="text-purple-600 font-semibold text-sm">{offer.prix_reduit} DT</p>
                          <p className="text-gray-400 line-through text-xs">{offer.prix_initial} DT</p>
                        </div>
                        <p className="text-xs text-gray-600">
                          Jusqu'au {new Date(offer.date_fin).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">
                          Places :{" "}
                          <span className={isOutOfStock ? "text-red-600 font-medium" : "text-gray-600"}>
                            {offer.quantite}
                          </span>
                        </p>
                        {!isOutOfStock && (
                          <div className="flex items-center">
                            <button
                              onClick={() => handleQuantityChange(offer.id, -1)}
                              disabled={selectedQuantity <= 1}
                              className={`px-2 py-1 border border-gray-100 rounded-l-md text-xs ${
                                selectedQuantity <= 1 ? "bg-gray-50 cursor-not-allowed" : "bg-white hover:bg-gray-50"
                              }`}
                              aria-label="Diminuer la quantité"
                            >
                              −
                            </button>
                            <span className="px-3 py-1 border-t border-b border-gray-100 text-xs">
                              {selectedQuantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(offer.id, 1)}
                              disabled={selectedQuantity >= offer.quantite}
                              className={`px-2 py-1 border border-gray-100 rounded-r-md text-xs ${
                                selectedQuantity >= offer.quantite
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white hover:bg-gray-50"
                              }`}
                              aria-label="Augmenter la quantité"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 flex-wrap gap-2">
                        <button
                          onClick={() => handleAjouterAuPanier(offer)}
                          className={`flex items-center px-3 py-2 rounded-md text-xs font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 w-auto ${
                            isOutOfStock
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg"
                          }`}
                          disabled={isOutOfStock}
                          aria-label={`Ajouter ${offer.titre} au panier`}
                        >
                          <ShoppingCart size={14} className="mr-1" />
                          Ajouter
                        </button>
                        <button
                          onClick={() => toggleReviewForm(offer.id)}
                          className="flex items-center px-3 py-2 rounded-md bg-gray-600 text-white text-xs font-medium hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 w-auto shadow-md hover:shadow-lg"
                          aria-label={`Laisser un avis pour ${offer.titre}`}
                        >
                          <MessageSquare size= {14} className="mr-1" />
                          Avis
                        </button>
                        {reviews[offer.id]?.length > 0 && (
                          <button
                            onClick={() => toggleReviewsVisibility(offer.id)}
                            className="flex items-center px-3 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium hover:from-blue-600 hover:to-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 w-auto shadow-md hover:shadow-lg"
                            aria-label={`${isReviewsVisible[offer.id] ? "Masquer" : "Voir"} les avis`}
                          >
                            <Eye size={14} className="mr-1" />
                            {isReviewsVisible[offer.id] ? "Masquer" : `Voir (${totalReviews})`}
                          </button>
                        )}
                      </div>
                      {isReviewOpen[offer.id] && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Laisser un avis</h4>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleReviewSubmit(offer.id);
                            }}
                            className="space-y-2"
                          >
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <label key={i} className="cursor-pointer">
                                  <Star
                                    size={16}
                                    className={i < newReview[offer.id]?.rating ? "text-yellow-400" : "text-gray-300"}
                                    fill={i < Math.round(newReview[offer.id]?.rating || 0) ? "currentColor" : "none"}
                                    onClick={() =>
                                      setNewReview({
                                        ...newReview,
                                        [offer.id]: { ...newReview[offer.id], rating: i + 1 },
                                      })
                                    }
                                    aria-label={`Noter ${i + 1} étoile(s)`}
                                  />
                                </label>
                              ))}
                            </div>
                            <textarea
                              className="w-full border border-gray-100 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs"
                              placeholder="Votre commentaire..."
                              value={newReview[offer.id]?.comment || ""}
                              onChange={(e) =>
                                setNewReview((prev) => ({
                                  ...prev,
                                  [offer.id]: { ...newReview[offer.id], comment: e.target.value },
                                }))
                              }
                              rows={3}
                              aria-label="Commentaire"
                            ></textarea>
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded-md text-xs hover:from-purple-600 hover:to-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 shadow-md hover:shadow-lg"
                              aria-label="Soumettre l'avis"
                            >
                              Soumettre
                            </button>
                          </form>
                        </div>
                      )}
                      {isReviewsVisible[offer.id] && reviews[offer.id]?.length > 0 && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Avis des clients</h4>
                          <div className="space-y-3">
                            {reviews[offer.id].map((review) => (
                              <div key={review.id} className="flex space-x-3 pb-3 border-b border-gray-100">
                                <div className="flex-shrink-0">
                                  {review.user.profile_image ? (
                                    <img
                                      src={review.user.profile_image}
                                      alt={`Photo de ${review.user.name}`}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                      <User size={16} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-xs font-semibold text-gray-800">{review.user.name}</h5>
                                  <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={12}
                                        className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                                        fill={i < review.rating ? "currentColor" : "none"}
                                        aria-hidden="true"
                                      />
                                    ))}
                                    <span className="ml-1 text-xs text-gray-500">{review.rating}/5</span>
                                  </div>
                                  <p className="mt-1 text-gray-600 text-xs leading-relaxed">{review.comment}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune offre disponible</h3>
              <p className="text-gray-600 text-sm">Aucune offre n'est disponible pour le moment.</p>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-green-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Succès</h2>
                  <p className="text-gray-600 text-sm mb-4">{modalMessage}</p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Modal */}
          {showErrorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-red-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Erreur</h2>
                  <p className="text-gray-600 text-sm mb-4">{modalMessage}</p>
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="px-3 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-md hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Warning Modal */}
          {showWarningModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-orange-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Attention</h2>
                  <p className="text-gray-600 text-sm mb-4">{modalMessage}</p>
                  <button
                    onClick={() => setShowWarningModal(false)}
                    className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}