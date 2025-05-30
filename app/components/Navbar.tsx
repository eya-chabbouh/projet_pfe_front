"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Heart,
  X,
  ShoppingCart,
  Filter,
  Settings,
  Mail,
  Home,
  LogOut,
  Trash2,
  History,
  Menu,
  AlertCircle,
  UserRoundPen,
} from "lucide-react"
import Link from "next/link"

interface User {
  name: string
  photo?: string
}

interface NavbarProps {
  onFilterClick?: () => void
  onCartUpdate?: () => void
}

export default function Navbar({ onFilterClick, onCartUpdate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()

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
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const res = await fetch("http://127.0.0.1:8000/api/client/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await res.json()
        setUser(userData)
      } catch (err) {
        console.error("Erreur lors de la récupération du profil", err)
      }
    }
    fetchUser()
    fetchCartCount()
  }, [])

  useEffect(() => {
    if (onCartUpdate) {
      fetchCartCount()
    }
  }, [onCartUpdate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setCartItemCount(0)
    router.push("/")
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

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">OF</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              OfferFlow
            </span>
          </div>

          {/* Desktop Navigation */}
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
            <Link
              href="/client/edit"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <UserRoundPen className="w-4 h-4" />
              <span>Modifier infos</span>
            </Link>
            <Link
              href="/client/settings"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </Link>
           
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

          {/* User Menu */}
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

      {/* Mobile Sidebar */}
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
                  href="/client/edit"
                  className="flex items-center gap-3 text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <UserRoundPen className="w-4 h-4" />
                  <span>Modifier infos</span>
                </Link>
                <Link
                  href="/client/settings"
                  className="flex items-center gap-3 text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Paramètres</span>
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
                <button
                  onClick={onFilterClick}
                  className="flex items-center gap-3 text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors w-full"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtrer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h2>
              <p className="text-gray-600 mb-6">
                Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.
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
    </nav>
  )
}