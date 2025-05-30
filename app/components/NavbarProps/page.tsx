
"use client";

import { useState, useEffect, type ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  MessageSquare,
  Package,
  ShoppingCart,
  Calendar,
  Users,
  User,
  Ban,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

interface Entite {
  noms_entites: string;
  description: string;
  localisation: string;
  image?: string;
}

interface Reservation {
  id: number;
  nom_client: string;
  email_client: string;
  date_reservation: string;
  montant: number;
  offre: string;
  statut: string;
}

const NavbarProps = ({ children }: { children: ReactNode }) => {
  const [navbarProps, setNavbarProps] = useState<{
    reservations_count: number;
    clients_count: number;
    popular_services: {
      nom: string;
      description: string;
      adresse: string;
      reservations_count: number;
    }[];
  }>({
    reservations_count: 0,
    clients_count: 0,
    popular_services: [],
  });

  const [entites, setEntites] = useState<Entite[]>([]);
  const [canceledReservations, setCanceledReservations] = useState<Reservation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newCancellationCount, setNewCancellationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await axios.get("http://127.0.0.1:8000/api/entites", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setEntites(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des entités:", error);
      }
    };

    const fetchNavbarProps = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await axios.get("http://127.0.0.1:8000/api/prop/dashboard2", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setNavbarProps(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données dashboard:", error);
      }
    };

    const fetchCanceledReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await axios.get("http://127.0.0.1:8000/api/prop/reservations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const canceled = response.data
          .filter((res: any) => res.statut === "annulée")
          .map((res: any) => ({
            id: res.id,
            nom_client: res.client_name ?? "Nom inconnu",
            email_client: res.client_email ?? "Email inconnu",
            date_reservation: res.date_reservation,
            montant: res.montant ?? 0,
            offre: res.offre_titre ?? "Offre inconnue",
            statut: res.statut,
          }))
          .sort(
            (a: Reservation, b: Reservation) =>
              new Date(b.date_reservation).getTime() - new Date(a.date_reservation).getTime(),
          );
        const previousCount = Number.parseInt(localStorage.getItem("cancellationCount") || "0");
        setCanceledReservations(canceled);
        setNewCancellationCount(canceled.length - previousCount);
        localStorage.setItem("cancellationCount", canceled.length.toString());
      } catch (error) {
        console.error("Erreur lors de la récupération des réservations annulées:", error);
      }
    };

    fetchUserData();
    fetchNavbarProps();
    fetchCanceledReservations();
    const interval = setInterval(fetchCanceledReservations, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cancellationCount");
    router.push("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { href: "/dashbord2", icon: BarChart3, text: "Tableau de Bord" },
    { href: "/offres/avis", icon: MessageSquare, text: "Avis Clients" },
    { href: "/offres", icon: Package, text: "Offres" },
    { href: "/res_prop", icon: ShoppingCart, text: "Commandes" },
    { href: "/res_prop/offre_res", icon: Calendar, text: "Commandes par offres" },
    { href: "/res_prop/res_clientprop", icon: Users, text: "Commandes par client" },
    { href: "/annulation-commande", icon: Ban, text: "Annulation Commande" },
    { href: "/prop_profil", icon: User, text: "Profil" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-56" : "w-16"
        } bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashbord2" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OF</span>
              </div>
            {isSidebarOpen && (
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                OfferFlow
              </span>
            )}
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200 group text-sm"
              >
                <Icon className="w-4 h-4 group-hover:text-blue-600" />
                {isSidebarOpen && <span className="font-medium">{item.text}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm relative z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {newCancellationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {newCancellationCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div
                    className="absolute right-0 top-12 w-72 bg-white shadow-lg rounded-lg p-4 mt-2 max-h-80 overflow-y-auto"
                    style={{ zIndex: 1050 }}
                  >
                    <h6 className="font-semibold text-gray-800 mb-3 text-sm">Commandes Annulées</h6>
                    {canceledReservations.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune commande annulée.</p>
                    ) : (
                      canceledReservations.map((reservation) => (
                        <div
                          key={`reservation-${reservation.id}`}
                          className="border-b border-gray-100 py-3 last:border-b-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{reservation.nom_client}</p>
                              <p className="text-xs text-gray-600">{reservation.email_client}</p>
                              <p className="text-xs text-gray-500">Offre: {reservation.offre}</p>
                              <p className="text-xs text-gray-500">
                                Date: {new Date(reservation.date_reservation).toLocaleDateString()}
                              </p>
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium mt-1">
                                {reservation.statut}
                              </span>
                            </div>
                            <Link
                              href="/annulation-commande"
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                            >
                              Voir
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700 font-medium hidden sm:block text-sm">Prestataire</span>
                  <img
                    src={
                      entites[0]?.image
                        ? `http://127.0.0.1:8000/storage/${entites[0].image}`
                        : "/placeholder.svg?height=32&width=32"
                    }
                    alt="Profil"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-44 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/prop_profil"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <User className="w-4 h-4" />
                      Profil
                    </Link>
                    <Link
                      href="/prop_profil"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default NavbarProps;