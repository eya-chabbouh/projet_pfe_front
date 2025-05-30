"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Eye,
  EyeOff,
  Mail,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import AdminLayout from "@/app/components/AdminLayout/page";

interface Reservation {
  id: number;
  prix: string | null;
  statut: string | null;
  created_at: string;
  offre?: { titre: string | null };
  entite?: { nom_entites: string | null };
  user_id: number;
}

interface Client {
  id: number;
  name: string | null;
  email: string | null;
  tel: string | null;
  photo?: string;
  role: "admin" | "proprietaire" | "client";
  is_active: boolean;
}

const ClientReservationsPage = () => {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [user, setUser] = useState<Client | null>(null);
  const [filter, setFilter] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const clientsPerPage = 3;

  // Initialize token on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Function to fetch all data
  const fetchAllData = async () => {
    setIsLoading(true);
    if (!token) {
      setIsLoading(false);
      return router.push("/login");
    }

    try {
      // Fetch user data
      const userResponse = await axios.get("http://127.0.0.1:8000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userResponse.data);

      // Fetch users
      const usersResponse = await axios.get("http://127.0.0.1:8000/api/users");
      const validClients = usersResponse.data
        .filter((user: Client) => user.role === "client")
        .map((client: Client) => ({
          ...client,
          name: client.name || "Unknown",
          email: client.email || "N/A",
          tel: client.tel || "N/A",
        }));
      setClients(validClients);

      // Fetch reservations
      const reservationsResponse = await axios.get("http://127.0.0.1:8000/api/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const validReservations = reservationsResponse.data.map((res: Reservation) => ({
        ...res,
        prix: res.prix?.toString() || "0",
        statut: res.statut || "Unknown",
        entite: res.entite ? { ...res.entite, nom_entites: res.entite.nom_entites || "N/A" } : undefined,
        offre: res.offre ? { ...res.offre, titre: res.offre.titre || "N/A" } : undefined,
      }));
      setReservations(validReservations);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [router, token]);

  const filteredClients = clients.filter((client) => {
    const searchTerm = filter || "";
    const isMatchClient =
      (client.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.tel || "").toLowerCase().includes(searchTerm.toLowerCase());

    const clientReservations = reservations.filter((res) => res.user_id === client.id);
    const isMatchReservation = clientReservations.some(
      (res) =>
        (res.entite?.nom_entites || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.prix || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.statut || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.offre?.titre || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return isMatchClient || isMatchReservation;
  });

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / clientsPerPage));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * clientsPerPage,
    currentPage * clientsPerPage,
  );

  const getStatusBadge = (statut: string | null) => {
    const status = statut || "Unknown";
    switch (status.toLowerCase()) {
      case "payée":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-2.5 h-2.5" />
            Payée
          </span>
        );
      case "annulée":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-2.5 h-2.5" />
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
            <AlertTriangle className="w-2.5 h-2.5" />
            {status}
          </span>
        );
    }
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="p-4"> 
        <div className="max-w-6xl mx-auto"> 
          {/* Header */}
          <div className="mb-6"> 
            <div className="flex items-center gap-2 mb-3"> 
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"> 
                <ShoppingCart className="w-5 h-5 text-white" /> 
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 
                  Commandes par Client
                </h1>
                <p className="text-gray-600 text-sm">Gérez toutes les commandes  des clients</p> 
              </div>
            </div>
          </div>

          {/* Card Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden"> 
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3"> 
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5"> 
                <User className="w-4 h-4" /> 
                Liste des Clients 
              </h3>
            </div>

            <div className="p-4"> 
              {/* Search Bar */}
              <div className="mb-4"> 
                <div className="relative max-w-sm"> 
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /> 
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm" 
                    placeholder="Rechercher ..."
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-12"> 
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"> 
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div> 
                  </div>
                  <p className="text-gray-600 text-sm">Chargement...</p> 
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-hidden border border-gray-100 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Client</th> 
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Téléphone</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedClients.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-12 text-center"> 
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"> 
                                <User className="w-8 h-8 text-blue-500" /> 
                              </div>
                              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun client trouvé</h3> 
                              <p className="text-gray-500 text-sm">Aucun client ne correspond à votre recherche.</p> 
                            </td>
                          </tr>
                        ) : (
                          paginatedClients.map((client) => {
                            const clientReservations = reservations.filter((res) => res.user_id === client.id);
                            const filteredClientReservations = clientReservations.filter(
                              (res) =>
                                (res.entite?.nom_entites || "").toLowerCase().includes((filter || "").toLowerCase()) ||
                                (res.prix || "").toLowerCase().includes((filter || "").toLowerCase()) ||
                                (res.statut || "").toLowerCase().includes((filter || "").toLowerCase()) ||
                                (res.offre?.titre || "").toLowerCase().includes((filter || "").toLowerCase()),
                            );

                            return (
                              <React.Fragment key={client.id}>
                                <tr className="hover:bg-blue-50/50 transition-colors">
                                  <td className="px-4 py-3"> 
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold"> {/* Reduced size from w-10 h-10 */}
                                        {(client.name || "U").charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900 text-sm">{client.name}</div> 
                                        {/* <div className="text-xs text-gray-500">ID: #{client.id}</div>  */}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3"> 
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <Mail className="w-3 h-3 text-gray-400" /> 
                                      {client.email}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3"> 
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <Phone className="w-3 h-3 text-gray-400" /> 
                                      {client.tel}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3"> 
                                    <button
                                      className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md" 
                                      onClick={() =>
                                        setSelectedClientId(selectedClientId === client.id ? null : client.id)
                                      }
                                    >
                                      {selectedClientId === client.id ? (
                                        <EyeOff className="w-3 h-3" /> 
                                      ) : (
                                        <Eye className="w-3 h-3" />
                                      )}
                                    </button>
                                  </td>
                                </tr>
                                {selectedClientId === client.id && (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="px-4 py-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50" 
                                    >
                                      <div className="space-y-3"> 
                                        <h6 className="text-base font-semibold text-gray-800 flex items-center gap-1.5"> 
                                          <CreditCard className="w-4 h-4 text-purple-500" /> 
                                          Commandes de {client.name}
                                        </h6>
                                        {filteredClientReservations.length === 0 ? (
                                          <div className="text-center py-6"> 
                                            <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-2"> 
                                              <ShoppingCart className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 italic text-sm">Aucune commande trouvée.</p> 
                                          </div>
                                        ) : (
                                          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                                            <table className="min-w-full divide-y divide-gray-200">
                                              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                                <tr>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Prestataire
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Offre
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Date
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Prix
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Statut
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-100">
                                                {filteredClientReservations.map((res) => (
                                                  <tr key={res.id} className="hover:bg-purple-50/30 transition-colors">
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900"> 
                                                      {res.entite?.nom_entites || "N/A"}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-600">
                                                      {res.offre?.titre || "N/A"}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-600"> 
                                                      <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-gray-400" /> 
                                                        {res.created_at?.slice(0, 10) || "N/A"}
                                                      </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm"> 
                                                      <div className="flex items-center gap-1 font-semibold text-green-600">
                                                        <CreditCard className="w-3 h-3" /> 
                                                        {res.prix} DT
                                                      </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm">{getStatusBadge(res.statut)}</td> 
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"> {/* Reduced margin from mt-6 and padding from px-6 py-4 */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3"> {/* Reduced gap from gap-4 */}
                      <div className="text-xs text-gray-600"> {/* Reduced font size to text-xs */}
                        Affichage de {(currentPage - 1) * clientsPerPage + 1} à{" "}
                        {Math.min(currentPage * clientsPerPage, filteredClients.length)} sur {filteredClients.length}{" "}
                        clients
                      </div>

                      <div className="flex items-center gap-1.5"> {/* Reduced gap from gap-2 */}
                        <button
                          className={`p-1.5 rounded-lg transition-colors border ${
                            currentPage === 1
                              ? "text-gray-400 cursor-not-allowed border-gray-200"
                              : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                          }`} 
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={isLoading || currentPage === 1}
                        >
                          <ChevronLeft className="w-3 h-3" /> {/* Reduced icon size from w-4 h-4 */}
                        </button>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors border ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent"
                                  : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                              }`} 
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={isLoading}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          className={`p-1.5 rounded-lg transition-colors border ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed border-gray-200"
                              : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                          }`} 
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={isLoading || currentPage === totalPages}
                        >
                          <ChevronRight className="w-3 h-3" /> {/* Reduced icon size from w-4 h-4 */}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClientReservationsPage;