"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { User, Building, MapPin, FileText, Tag, Check, X, ArrowLeft, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout/page";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  tel: string;
  photo?: string;
  role: "admin" | "proprietaire" | "client";
  is_active: boolean;
}

export default function PrestataireDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [entite, setEntite] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const id = searchParams?.get("id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  useEffect(() => {
    if (!id || !token) {
      if (id && token === null && typeof window !== "undefined") {
        return;
      }
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [catRes, entRes] = await Promise.all([
          axios.get("http://localhost:8000/api/public/categories"),
          axios.get(`http://localhost:8000/api/entites/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCategories(catRes.data);
        setEntite(entRes.data);

        const userRes = await axios.get(`http://localhost:8000/api/users/${entRes.data.user_id}`);
        setUserName(userRes.data.name);
      } catch (err) {
        console.error("Erreur chargement des données :", err);
        setMessage("Erreur lors du chargement des données.");
        setMessageType("error");
        setShowErrorModal(true);
      }
      setLoading(false);
    }

    fetchData();
  }, [id, token]);

  const handleAction = async (accepter: boolean) => {
    if (!entite) return;
    const url = accepter
      ? `http://127.0.0.1:8000/api/admin/entites/${entite.id}/accepter`
      : `http://127.0.0.1:8000/api/admin/entites/${entite.id}/refuser`;

    try {
      await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(`Demande ${accepter ? "acceptée" : "refusée"} avec succès.`);
      setMessageType("success");
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/demande_prop");
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la demande :", error);
      setMessage("Une erreur s'est produite. Veuillez réessayer.");
      setMessageType("error");
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600">Chargement des détails...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!entite) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Données introuvables</h2>
            <p className="text-gray-600">Les informations du prestataire n'ont pas pu être chargées.</p>
            <Link href="/demande_prop">
              <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                Retour à la liste
              </button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Détails du Prestataire
                </h1>
                <p className="text-gray-600">Examinez et validez la demande d'inscription</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-center">
              {entite.image && (
                <div className="mb-4">
                  <img
                    src={`http://localhost:8000/storage/${entite.image}`}
                    alt="Logo du prestataire"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold text-white mb-2">{entite.nom_entites}</h2>
              <p className="text-blue-100">Demande d'inscription en attente</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 text-blue-500" />
                    Nom complet du responsable
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-800">{userName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building className="w-4 h-4 text-purple-500" />
                    Nom du prestataire
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-800">{entite.nom_entites}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Localisation
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-800">{entite.localisation}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="w-4 h-4 text-orange-500" />
                    Catégorie
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      {categories.find((cat) => cat.id === entite.categ_id)?.nom || "Non spécifiée"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Description de l'activité
                </label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{entite.description}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleAction(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Check className="w-5 h-5" />
                    Accepter la demande
                  </button>
                  <button
                    onClick={() => handleAction(false)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <X className="w-5 h-5" />
                    Refuser la demande
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Cette action enverra une notification au prestataire
                </p>
              </div>
            </div>
          </div>

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-green-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Action réussie</h2>
                  <p className="text-gray-600 text-sm mb-4">{message}</p>
                  <button
                    onClick={() => router.push("/demande_prop")}
                    className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    Retour à la liste
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
                  <p className="text-gray-600 text-sm mb-4">{message}</p>
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}