"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  User,
  Heart,
  X,
  Search,
  ShoppingCart,
  Filter,
  Settings,
  Mail,
  Home,
  LogOut,
  Trash2,
  History,
  Menu,
  MapPin,
  Tag,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

// Interfaces remain unchanged
interface Category {
  id: number
  nom: string
  image?: string
}

interface Entity {
  id: number
  categ_id: number
  nom_entites: string
  description: string
  image: string
  localisation: string
  status: string
}

interface Offer {
  id: number
  titre: string
  description: string
  prix_reduit: number
  reduction: number
  entite_id: number
}

interface UserProfile {
  name: string
  email: string
  tel: string
  photo?: string
  ville: string
  gouvernement: string
  genre: string
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [entites, setEntites] = useState<Entity[]>([])
  const [offres, setOffres] = useState<Offer[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedVille, setSelectedVille] = useState<string>("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [villes, setVilles] = useState<string[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Removed canScrollLeft, canScrollRight, and categoryContainerRef
  // Removed visibleEntities state

  const handleEntityClick = (entity: Entity) => {
    router.push(`/offre_client?id=${entity.id}`)
  }

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const res = await fetch("http://127.0.0.1:8000/api/panier", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const totalItems = data.data.reduce((sum: number, item: any) => sum + item.quantite, 0)
        setCartItemCount(totalItems)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du panier", err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const urlParams = new URLSearchParams(window.location.search)
        const tokenFromURL = urlParams.get("token")
        const tokenFromStorage = localStorage.getItem("token")
        const token = tokenFromURL || tokenFromStorage

        if (!token) {
          alert("Token non trouvé, redirection vers la page de connexion.")
          router.push("/login")
          return
        }

        if (tokenFromURL) {
          localStorage.setItem("token", tokenFromURL)
        }

        const config = { headers: { Authorization: `Bearer ${token}` } }

        const [catRes, entRes, offRes, userRes] = await Promise.all([
          axios.get<Category[]>("http://127.0.0.1:8000/api/categories", config),
          axios.get<Entity[]>("http://127.0.0.1:8000/api/entites", config),
          axios.get<Offer[]>("http://127.0.0.1:8000/api/offres", config),
          axios.get<UserProfile>("http://127.0.0.1:8000/api/client/profile", config),
        ])

        setCategories(catRes.data)
        setEntites(entRes.data)
        setOffres(offRes.data)
        setUser(userRes.data)

        const uniqueVilles = Array.from(new Set(entRes.data.map((ent) => ent.localisation)))
        setVilles(uniqueVilles)

        fetchCartCount()
      } catch (error) {
        console.error("Erreur lors du chargement des données", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cartUpdate") {
        fetchCartCount()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setCartItemCount(0)
    router.push("/")
  }

  const handleFavoriteToggle = async (event: React.MouseEvent, entityId: number) => {
    event.stopPropagation()

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "http://127.0.0.1:8000/api/favoris",
        { entite_id: entityId },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setFavorites((prevFavorites) => [...prevFavorites, entityId])
      setFeedbackMessage(response.data.message)
      setFeedbackType("success")
    } catch (error: any) {
      if (error.response) {
        setFeedbackMessage(error.response.data.message)
        setFeedbackType("error")
      } else {
        console.error("Erreur lors de la mise à jour des favoris", error)
        setFeedbackMessage("Une erreur est survenue. Veuillez réessayer.")
        setFeedbackType("error")
      }
    }

    setTimeout(() => {
      setFeedbackMessage(null)
      setFeedbackType(null)
    }, 3000)
  }

  const filteredCategories = categories.filter((cat) => cat.nom.toLowerCase().includes(search.toLowerCase()))

  const filteredEntites = entites
    .filter((entite) => entite.status === "accepté")
    .filter(
      (ent) =>
        (!selectedCategory || ent.categ_id === selectedCategory) &&
        (!selectedVille || ent.localisation === selectedVille),
    )

  const getOffreForEntity = (entityId: number) => {
    const entityOffers = offres.filter((off) => off.entite_id === entityId)
    return entityOffers.sort((a, b) => b.reduction - a.reduction)[0]
  }

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://127.0.0.1:8000/api/client/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        localStorage.removeItem("token")
        setCartItemCount(0)
        router.push("/")
      } else {
        alert("Erreur lors de la suppression du compte.")
      }
    } catch (err) {
      console.error(err)
      alert("Erreur réseau.")
    }
  }

  // Removed checkScrollPosition, scrollCategories, and related useEffect

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation (unchanged) */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OF</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                OfferFlow
              </span>
            </div>
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher ..."
                  className="w-full py-2.5 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none focus:ring-4 transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/dashbordC"
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </Link>
              <Link
                href="/historique"
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Commandes</span>
              </Link>
              <Link
                href="/favoris"
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Favoris</span>
              </Link>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtrer</span>
              </button>
              <Link href="/panier" className="relative">
                <div className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <div className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                  <span>Panier</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user?.photo ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${user.photo}`}
                      alt="Profil"
                      className="w-8 h-8 rounded-full border-2 border-purple-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-gray-800">{user?.name || "Client"}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <Link
                      href="/client/edit"
                      className="flex items-center px-4 py-2 hover:bg-purple-50 text-gray-700 gap-3"
                    >
                      <User className="w-4 h-4 text-purple-500" />
                      <span>Mon Profil</span>
                    </Link>
                    <Link
                      href="/favoris"
                      className="flex items-center px-4 py-2 hover:bg-purple-50 text-gray-700 gap-3"
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Favoris</span>
                    </Link>
                    <Link
                      href="/client/settings"
                      className="flex items-center px-4 py-2 hover:bg-purple-50 text-gray-700 gap-3"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span>Paramètres</span>
                    </Link>
                    <hr className="my-1 border-gray-200" />
                     <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 gap-3"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>Supprimer le compte</span>
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 gap-3"
                    >
                      <LogOut className="w-4 h-4 text-orange-500" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar (unchanged) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white shadow-xl">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-600 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <Link
                  href="/dashbordC"
                  className="flex items-center gap-3 text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Home className="w-4 h-4" />
                  <span>Accueil</span>
                </Link>
                <Link
                  href="/historique"
                  className="flex items-center gap-3 text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <History className="w-4 h-4" />
                  <span>Mes Commandes</span>
                </Link>
                <Link
                  href="/favoris"
                  className="flex items-center gap-3 text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Heart className="w-4 h-4" />
                  <span>Favoris</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </Link>
                <Link
                  href="/panier"
                  className="flex items-center gap-3 text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                  <span>Panier</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal (unchanged) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Filtres
              </h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none focus:ring-4 transition-colors"
                  value={selectedCategory ?? ""}
                  onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none focus:ring-4 transition-colors"
                  value={selectedVille}
                  onChange={(e) => setSelectedVille(e.target.value)}
                >
                  <option value="">Toutes les villes</option>
                  {villes.map((ville, index) => (
                    <option key={index} value={ville}>
                      {ville}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <section className="py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-purple-50 border border-gray-200"
              }`}
            >
              <Tag className="w-4 h-4" />
              Toutes
            </button>
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-purple-50 border border-gray-200"
                }`}
              >
                {cat.image && (
                  <img
                    src={`http://127.0.0.1:8000/storage/${cat.image}`}
                    alt={cat.nom}
                    className="w-5 h-5 object-cover rounded-full"
                  />
                )}
                {cat.nom}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Toast (unchanged) */}
      {feedbackMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div
            className={`p-4 rounded-lg shadow-lg border ${
              feedbackType === "success"
                ? "bg-purple-50 text-purple-800 border-purple-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedbackType === "success" ? (
                <CheckCircle className="w-5 h-5 text-purple-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className="font-medium">{feedbackMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Entity Sections */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {(selectedCategory ? categories.filter((c) => c.id === selectedCategory) : filteredCategories).map(
            (category) => {
              const categoryEntites = filteredEntites.filter((e) => e.categ_id === category.id)
              if (categoryEntites.length === 0) return null

              return (
                <div key={category.id}>
                  <h3
                    className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors mb-6"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.nom}
                  </h3>
                  <div className="flex gap-6 overflow-x-auto scrollbar-hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {categoryEntites.map((ent) => {
                      const isFavorite = favorites.includes(ent.id)
                      const offer = getOffreForEntity(ent.id)
                      return (
                        <div
                          key={ent.id}
                          onClick={() => handleEntityClick(ent)}
                          className="group bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-purple-200 flex-shrink-0 w-64"
                        >
                          <div className="relative overflow-hidden">
                            <img
                              src={`http://127.0.0.1:8000/storage/${ent.image}` || "/placeholder.svg"}
                              alt={ent.nom_entites}
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <button
                              onClick={(e) => handleFavoriteToggle(e, ent.id)}
                              className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm transition-colors ${
                                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                            </button>
                            {offer && (
                              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                -{offer.reduction}%
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                              {ent.nom_entites}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ent.description}</p>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{ent.localisation}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            },
          )}
        </div>
      </section>

      {/* Delete Account Modal (unchanged) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h2>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    handleDeleteAccount()
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}