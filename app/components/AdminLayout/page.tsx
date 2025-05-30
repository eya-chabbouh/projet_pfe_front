"use client"

import { type ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  BarChart3,
  Users,
  FileText,
  Clock,
  List,
  Calendar,
  BadgeIcon as IdCard,
  Briefcase,
  AlertCircle,
  Bell,
  Mail,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"

interface UserType {
  name: string
  email: string
  tel: string
  photo?: string
  role: "admin" | "proprietaire"
}

interface Demande {
  id: number
  nom_entites: string
  email: string
  status: string
}

interface Annulation {
  id: number
  nom_client: string
  email_client: string
  date_reservation: string
  montant: number
  offre: string
  statut: string
  paiement_statut: string
  annulation_statut: "en_attente" | "acceptee" | "refusee"
}

interface Reclamation {
  id: number
  nom: string
  email: string
  message: string
  user_id?: number | null
}

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [annulations, setAnnulations] = useState<Annulation[]>([])
  const [reclamations, setReclamations] = useState<Reclamation[]>([])
  const [showDemandes, setShowDemandes] = useState(false)
  const [showReclamations, setShowReclamations] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const profileRes = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(profileRes.data)

        const demandesRes = await axios.get("http://127.0.0.1:8000/api/admin/entites-attente", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setDemandes(demandesRes.data)

        const annulationRes = await axios.get("http://127.0.0.1:8000/api/admin/annulations", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const annulationsTransformees = annulationRes.data.map((res: any) => ({
          id: res.id,
          nom_client: res.user?.name ?? "Nom inconnu",
          email_client: res.user?.email ?? "Email inconnu",
          date_reservation: res.reservation?.created_at,
          montant: res.reservation?.prix,
          offre: res.reservation?.offre?.titre ?? "Offre inconnue",
          statut: res.reservation?.statut,
          paiement_statut: res.reservation?.paiement?.statut ?? "non_payé",
          annulation_statut: res.annulation_statut,
        }))
        setAnnulations(annulationsTransformees)

        const reclamationRes = await axios.get("http://127.0.0.1:8000/api/reclamations", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setReclamations(reclamationRes.data.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const pendingDemandesCount = demandes.length + annulations.filter((a) => a.annulation_statut === "en_attente").length

  const menuItems = [
    { href: "/dashbord", icon: BarChart3, text: "Tableau de Bord" },
    { href: "/users", icon: Users, text: "Utilisateurs" },
    { href: "/Client-Side", icon: FileText, text: "Demande D'annulation" },
    { href: "/demande_prop", icon: Clock, text: "Demande De prestataire" },
    { href: "/categories", icon: List, text: "Catégories" },
    { href: "/res/total", icon: Calendar, text: "Commandes" },
    { href: "/res", icon: IdCard, text: "Commandes par Client" },
    { href: "/res/prop", icon: Briefcase, text: "Commandes par Prestataire" },
    { href: "/offres/reclam", icon: AlertCircle, text: "Réclamation de client" },
    { href: "/admin", icon: User, text: "Profil" },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-60" : "w-14"
        } bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-lg transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashbord" className="flex items-center gap-2">
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

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-2 px-2 py-2 rounded-md text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200 group text-sm"
              >
                <Icon className="w-4 h-4 group-hover:text-blue-600" />
                {isSidebarOpen && <span className="font-medium">{item.text}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-1.5 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isSidebarOpen ? "ml-60" : "ml-14"} transition-all duration-300`}>
        {/* Top Navigation */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm relative z-40">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} className="md:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <Menu className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowDemandes(!showDemandes)}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-4 h-4 text-gray-600" />
                  {pendingDemandesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingDemandesCount}
                    </span>
                  )}
                </button>

                {showDemandes && (
                  <div className="absolute right-0 top-10 w-72 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 z-50 max-h-80 overflow-y-auto">
                    <h6 className="font-semibold text-gray-800 mb-2 text-sm">Demandes en attente</h6>
                    {demandes.length === 0 ? (
                      <p className="text-gray-500 text-xs">Aucune demande.</p>
                    ) : (
                      demandes.map((demande) => (
                        <div key={demande.id} className="border-b border-gray-100 py-2 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{demande.nom_entites}</p>
                              <p className="text-xs text-gray-600">{demande.email}</p>
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  demande.status === "accepté"
                                    ? "bg-green-100 text-green-700"
                                    : demande.status === "refusé"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {demande.status}
                              </span>
                            </div>
                            <Link
                              href={`/RegisterPrestataire?id=${demande.id}`}
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                            >
                              Voir
                            </Link>
                          </div>
                        </div>
                      ))
                    )}

                    {annulations.filter((a) => a.annulation_statut === "en_attente").length > 0 && (
                      <>
                        <hr className="my-2" />
                        <h6 className="font-semibold text-gray-800 mb-2 text-sm">Annulations</h6>
                        {annulations
                          .filter((a) => a.annulation_statut === "en_attente")
                          .map((annulation) => (
                            <div
                              key={`annulation-${annulation.id}`}
                              className="border-b border-gray-100 py-2 last:border-b-0"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-800 text-sm">{annulation.nom_client}</p>
                                  <p className="text-xs text-gray-600">{annulation.email_client}</p>
                                </div>
                                <Link
                                  href="/Client-Side"
                                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                >
                                  Voir
                                </Link>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="relative">
                <button
                  onClick={() => setShowReclamations(!showReclamations)}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-600" />
                  {reclamations.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {reclamations.length}
                    </span>
                  )}
                </button>

                {showReclamations && (
                  <div className="absolute right-0 top-10 w-72 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 z-50 max-h-80 overflow-y-auto">
                    <h6 className="font-semibold text-gray-800 mb-2 text-sm">Réclamations</h6>
                    {reclamations.length === 0 ? (
                      <p className="text-gray-500 text-xs">Aucune réclamation.</p>
                    ) : (
                      reclamations.map((reclamation) => (
                        <div
                          key={`reclamation-${reclamation.id}`}
                          className="border-b border-gray-100 py-2 last:border-b-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{reclamation.nom}</p>
                              <p className="text-xs text-gray-600">{reclamation.email}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{reclamation.message}</p>
                            </div>
                            <Link
                              href="/offres/reclam"
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
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700 font-medium text-sm hidden sm:block">
                    {user?.role === "admin" ? "Admin" : "Admin"}
                  </span>
                  <img
                    src={
                      user?.photo
                        ? `http://127.0.0.1:8000/storage/${user.photo}`
                        : "/placeholder.svg?height=28&width=28"
                    }
                    alt="Profil"
                    className="w-7 h-7 rounded-full object-cover border-2 border-gray-200"
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 py-1.5 z-50">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <User className="w-3 h-3" />
                      Profil
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Settings className="w-3 h-3" />
                      Paramètres
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left text-sm"
                    >
                      <LogOut className="w-3 h-3" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout