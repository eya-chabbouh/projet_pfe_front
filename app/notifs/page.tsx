"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

interface Reservation {
  id: number;
  user_id: number;
  offre_id: number;
  entite_id: number;
  created_at: string;
  prix: string;
  quantite_reservee: number;
  statut: string;
  paiement?: Paiement;
  payment_reference?: string;
  offre: Offre;
}

interface Paiement {
  id: number;
  statut: string;
  reference: string;
}

interface Offre {
  id: number;
  titre: string;
  description: string;
  prix_reduit: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  tel?: string;
}

interface Entity {
  id: number;
  nom_entites: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservationId");

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [relatedReservations, setRelatedReservations] = useState<Reservation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reservationId) {
      setError("ID de réservation manquant.");
      setLoading(false);
      return;
    }

    const fetchReservationDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token manquant.");

        // Fetch the specific reservation
        const res = await axios.get<Reservation>(`http://127.0.0.1:8000/api/reservations/${reservationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReservation(res.data);

        // Fetch user details
        const userRes = await axios.get<User>(`http://127.0.0.1:8000/api/users/${res.data.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userRes.data);

        // Fetch entity details
        const entiteRes = await axios.get<Entity>(`http://127.0.0.1:8000/api/entites/${res.data.entite_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEntity(entiteRes.data);

        // Fetch all reservations for the same user
        const allReservationsRes = await axios.get<Reservation[]>(`http://127.0.0.1:8000/api/reservations`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: res.data.user_id },
        });

        // Filter reservations with the same created_at date
        const related = allReservationsRes.data.filter(
          (r) => r.created_at === res.data.created_at && r.id !== res.data.id
        );

        setRelatedReservations(related);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [reservationId]);

  if (loading) return <p className="text-center text-lg text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  const handlePrint = () => {
    window.print();
  };

  // Calculate montant for a single reservation
  const calculateMontant = (reservation: Reservation) => {
    const prix = parseFloat(reservation.offre.prix_reduit);
    const quantite = reservation.quantite_reservee;
    return isNaN(prix) ? "Non disponible" : (prix * quantite).toFixed(2) + " DT";
  };

  // Calculate total montant for all reservations
  const calculateTotalMontant = () => {
    const allReservations = reservation ? [reservation, ...relatedReservations] : relatedReservations;
    return allReservations
      .reduce((total, r) => {
        const prix = parseFloat(r.offre.prix_reduit);
        const quantite = r.quantite_reservee;
        return total + (isNaN(prix) ? 0 : prix * quantite);
      }, 0)
      .toFixed(2) + " DT";
  };

  // Generate offer string with all titles and their details
  const getOfferString = () => {
    const allReservations = reservation ? [reservation, ...relatedReservations] : relatedReservations;
    return allReservations
      .map((r) => `${r.offre.titre} (Quantité: ${r.quantite_reservee}, Montant: ${calculateMontant(r)})`)
      .join(" / ");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8">
          <img src="/images/aa.png" alt="Logo" className="w-12 h-auto mr-3" />
          <h1 className="text-3xl font-bold text-blue-600">Détails de votre Commande</h1>
        </div>

        {reservation && user && entity && (
          <>
            <div className="space-y-6">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2 text-left">Détails</th>
                    <th className="border px-4 py-2 text-left">Informations</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border px-4 py-2">Réservation ID</td><td className="border px-4 py-2">{reservation.id}</td></tr>
                  <tr><td className="border px-4 py-2">Utilisateur</td><td className="border px-4 py-2">{user.name}</td></tr>
                  <tr><td className="border px-4 py-2">Email</td><td className="border px-4 py-2">{user.email}</td></tr>
                  <tr><td className="border px-4 py-2">Téléphone</td><td className="border px-4 py-2">{user.tel || "Non renseigné"}</td></tr>
                  <tr><td className="border px-4 py-2">Service</td><td className="border px-4 py-2">{entity.nom_entites}</td></tr>
                  <tr><td className="border px-4 py-2">Date</td><td className="border px-4 py-2">{new Date(reservation.created_at).toLocaleString()}</td></tr>
                  {/* Single Offer Row with all offers */}
                  <tr>
                    <td className="border px-4 py-2">Offre</td>
                    <td className="border px-4 py-2">{getOfferString()}</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Montant Total</td>
                    <td className="border px-4 py-2 font-bold">{calculateTotalMontant()}</td>
                  </tr>
                  {/* <tr>
                    <td className="border px-4 py-2">Statut</td>
                    <td className="border px-4 py-2">
                      <span className={reservation.statut === "paid" ? "text-green-600 font-bold" : "text-yellow-600"}>
                        {reservation.statut}
                      </span>
                    </td>
                  </tr> */}
                  <tr>
                    <td className="border px-4 py-2">Statut de paiement</td>
                    <td className="border px-4 py-2">
                      {reservation.paiement?.statut === "succeeded" ? (
                        <span className="text-green-600 font-bold">Payé</span>
                      ) : (
                        <span className="text-yellow-600 font-bold">{reservation.paiement?.statut || "Non payé"}</span>
                      )}
                    </td>
                  </tr>
                  {reservation.payment_reference && (
                    <tr>
                      <td className="border px-4 py-2">Référence de paiement</td>
                      <td className="border px-4 py-2">{reservation.payment_reference}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}