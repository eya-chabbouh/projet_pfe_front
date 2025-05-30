"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Search,
  Filter,
  Edit,
  Eye,
  Power,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  X,
  Mail,
  Phone,
  MapPin,
  Shield,
  Building2,
  ImageIcon,
} from "lucide-react"
import AdminLayout from "../components/AdminLayout/page"

export interface UserProfile {
  id: number
  name: string
  email: string
  tel: string
  photo?: string
  role: string
  is_active: boolean
  ville?: string
  gouvernement?: string
  genre?: string
}

interface Entite {
  id: number
  nom_entites: string
  description: string
  localisation: string
  image?: string
}

const UserList = () => {
  const [demandes, setDemandes] = useState<any[]>([])
  const [showDemandes, setShowDemandes] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedIsActive, setSelectedIsActive] = useState<boolean>(false)

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<{ id: number; role: string } | null>(null)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<number | null>(null)
  const [detailProfile, setDetailProfile] = useState<UserProfile | null>(null)
  const [entites, setEntites] = useState<Entite[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Edit modal states
  const [userField, setUserField] = useState({
    name: "",
    email: "",
    role: "",
    tel: "",
    photo: null,
  })
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    tel: "",
  })
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    tel: false,
  })
  const [editLoading, setEditLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error)
      }
    }
    fetchUserData()
  }, [router])

  useEffect(() => {
    const fetchDemandes = async () => {
      const token = localStorage.getItem("token")
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/admin/entites-attente", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setDemandes(response.data)
      } catch (error) {
        console.error("Erreur lors du chargement des demandes :", error)
      }
    }
    fetchDemandes()
  }, [user])

  useEffect(() => {
    fetchUsers()
  }, [search, role, currentPage])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/users", {
        params: {
          search,
          role,
        },
      })
      console.log(
        "Users fetched:",
        response.data.map((u: UserProfile) => ({ id: u.id, is_active: u.is_active })),
      )
      setUsers(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value)
    setCurrentPage(1)
  }

  const handleDeactivate = (userId: number, isActive: boolean) => {
    setSelectedUserId(userId)
    setSelectedIsActive(!isActive)
    setShowModal(true)
  }

  const handleViewDetails = async (userId: number, userRole: string) => {
    setSelectedUserForDetail({ id: userId, role: userRole })
    setShowDetailModal(true)
    setDetailLoading(true)

    try {
      const token = localStorage.getItem("token")
      let profileResponse

      if (userRole === "client") {
        profileResponse = await axios.get(`http://127.0.0.1:8000/api/client/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else if (userRole === "admin") {
        profileResponse = await axios.get(`http://127.0.0.1:8000/api/detail/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        profileResponse = await axios.get(`http://127.0.0.1:8000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      setDetailProfile(profileResponse.data)

      if (userRole === "proprietaire") {
        try {
          const entitesResponse = await axios.get(`http://127.0.0.1:8000/api/users/${userId}/entites`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setEntites(entitesResponse.data)
        } catch (error) {
          console.error("Erreur lors du chargement des entités:", error)
          setEntites([])
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleEditUser = async (userId: number) => {
    setSelectedUserForEdit(userId)
    setShowEditModal(true)
    setEditLoading(true)

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}`)
      setUserField({
        name: response.data.name || "",
        email: response.data.email || "",
        role: response.data.role || "",
        tel: response.data.tel || "",
        photo: null,
      })
      setTouched({ name: false, email: false, tel: false })
      setErrors({ name: "", email: "", tel: "" })
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur:", err)
    } finally {
      setEditLoading(false)
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { name: "", email: "", tel: "" }

    if (!userField.name.trim()) {
      newErrors.name = "Le nom est obligatoire"
      isValid = false
    }
    if (!userField.email.trim()) {
      newErrors.email = "L'email est obligatoire"
      isValid = false
    } else {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      const atSymbolCount = (userField.email.match(/@/g) || []).length
      if (atSymbolCount !== 1) {
        newErrors.email = "L'email doit contenir exactement un symbole @"
        isValid = false
      } else if (!emailRegex.test(userField.email)) {
        newErrors.email = "L'email n'est pas valide"
        isValid = false
      }
    }
    if (!userField.tel.trim()) {
      newErrors.tel = "Le téléphone est obligatoire"
      isValid = false
    } else if (!/^\d{8}$/.test(userField.tel)) {
      newErrors.tel = "Le téléphone doit contenir exactement 8 chiffres"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const isFieldValid = (field: keyof typeof userField) => {
    if (field === "name") return userField.name.trim()
    if (field === "email") {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      const atSymbolCount = (userField.email.match(/@/g) || []).length
      return userField.email.trim() && atSymbolCount === 1 && emailRegex.test(userField.email)
    }
    if (field === "tel") return userField.tel.trim() && /^\d{8}$/.test(userField.tel)
    return true
  }

  const changeUserFieldHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "tel") {
      if (!/^\d*$/.test(value)) return
      if (value.length > 8) return
    }
    setUserField({ ...userField, [name]: value })
    setTouched({ ...touched, [name]: true })
    setErrors({ ...errors, [name]: "" })
  }

  const onSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, tel: true })
    if (!validateForm()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("_method", "PUT")
    formData.append("name", userField.name)
    formData.append("email", userField.email)
    formData.append("role", userField.role)
    formData.append("tel", userField.tel)

    try {
      await axios.post(`http://127.0.0.1:8000/api/users/${selectedUserForEdit}`, formData)
      fetchUsers()
      setShowEditModal(false)
      setMessage("Utilisateur mis à jour avec succès.")
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeactivation = async () => {
    if (selectedUserId === null) return
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        `http://127.0.0.1:8000/api/users/${selectedUserId}/activation`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user.id === selectedUserId ? { ...user, is_active: response.data.is_active } : user,
        )
        console.log(
          "Updated users after toggle:",
          updatedUsers.map((u) => ({ id: u.id, is_active: u.is_active })),
        )
        return updatedUsers
      })
      setMessage(
        response.data.is_active ? "Utilisateur activé avec succès." : "Utilisateur désactivé avec succès.",
      )
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation de l'utilisateur", error)
      setMessage("Une erreur est survenue.")
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setShowModal(false)
      setSelectedUserId(null)
      setSelectedIsActive(false)
    }
  }

  const getRoleStyle = (role: string | undefined) => {
    if (!role) return "bg-gray-100 text-gray-700 border-gray-200"

    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200"
      case "client":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "proprietaire":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return "Inconnu"

    switch (role.toLowerCase()) {
      case "proprietaire":
        return "Propriétaire"
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  const getRoleIcon = (role: string | undefined) => {
    if (!role) return <Mail className="w-5 h-5 text-gray-500" />

    switch (role.toLowerCase()) {
      case "admin":
        return <Shield className="w-5 h-5 text-red-500" />
      case "proprietaire":
        return <Building2 className="w-5 h-5 text-green-500" />
      case "client":
        return <Mail className="w-5 h-5 text-blue-500" />
      default:
        return <Mail className="w-5 h-5 text-gray-500" />
    }
  }

  // Pagination logic
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) && (role === "" || (user.role && user.role === role)),
  )
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage))
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-sm text-gray-600">Gérez et administrez tous les utilisateurs de la plateforme</p>
              </div>
            </div>

            {/* Message de succès/erreur */}
            {message && (
              <div
                className={`border px-4 py-3 rounded-lg mb-6 flex items-center gap-2 ${
                  message.includes("succès")
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <X className="w-5 h-5" />
                {message}
              </div>
            )}
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                  placeholder="Rechercher ..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white text-sm"
                  onChange={handleRoleChange}
                  value={role}
                >
                  <option value="">Tous les rôles</option>
                  <option value="admin">Admin</option>
                  <option value="proprietaire">Propriétaire</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                Liste des Utilisateurs
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600">Chargement des utilisateurs...</span>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-500">Aucun utilisateur ne correspond à votre recherche.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ID</th> */}
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Utilisateur</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Rôle</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Statut</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                            {/* <td className="px-4 py-3 text-xs font-medium text-gray-900">#{user.id}</td> */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-xs">{user.name}</div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">{user.tel}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleStyle(user.role)}`}
                              >
                                {getRoleLabel(user.role)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  !user.is_active
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                }`}
                              >
                                {!user.is_active ? (
                                  <UserCheck className="w-3 h-3" />
                                ) : (
                                  <UserX className="w-3 h-3" />
                                )}
                                {!user.is_active ? "Actif" : "Inactif"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  onClick={() => handleEditUser(user.id)}
                                  title="Modifier"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  className={`p-1 rounded-lg transition-colors ${
                                    !user.is_active
                                      ? "text-red-600 hover:bg-red-100"
                                      : "text-green-600 hover:bg-green-100"
                                  }`}
                                  onClick={() => handleDeactivate(user.id, user.is_active)}
                                  title={!user.is_active ? "Désactiver" : "Activer"}
                                >
                                  <Power className="w-3 h-3" />
                                </button>
                                <button
                                  className="p-1 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                  onClick={() => handleViewDetails(user.id, user.role)}
                                  title="Voir détails"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-3 space-y-3">
                  {paginatedUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-xs">{user.name}</div>
                            <div className="text-xs text-gray-500">ID: #{user.id}</div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleStyle(user.role)}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs mb-3">
                        <div className="text-gray-600">{user.email}</div>
                        <div className="text-gray-600">{user.tel}</div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            !user.is_active
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {!user.is_active ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {!user.is_active ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <div className="flex justify-end gap-1">
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-xs"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Edit className="w-3 h-3" />
                          Modifier
                        </button>
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors text-xs"
                          onClick={() => handleViewDetails(user.id, user.role)}
                        >
                          <Eye className="w-3 h-3" />
                          Détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-gray-600">
                      {filteredUsers.length === 0 ? (
                        "Aucun utilisateur à afficher"
                      ) : (
                        <>
                          Affichage de {(currentPage - 1) * usersPerPage + 1} à{" "}
                          {Math.min(currentPage * usersPerPage, filteredUsers.length)} sur {filteredUsers.length}{" "}
                          utilisateurs
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className={`p-1 rounded-lg transition-colors border ${
                          currentPage === 1 || filteredUsers.length === 0
                            ? "text-gray-400 cursor-not-allowed border-gray-200"
                            : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                        }`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || filteredUsers.length === 0}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>

                      {filteredUsers.length === 0 ? (
                        <button className="px-2 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-400 cursor-not-allowed">
                          1
                        </button>
                      ) : (
                        Array.from({ length: Math.min(Math.max(totalPages, 1), 5) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <button
                              key={pageNum}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors border ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent"
                                  : totalPages === 1
                                    ? "text-gray-400 cursor-not-allowed border-gray-200"
                                    : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                              }`}
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={totalPages === 1}
                            >
                              {pageNum}
                            </button>
                          )
                        })
                      )}

                      <button
                        className={`p-1 rounded-lg transition-colors border ${
                          currentPage === totalPages || filteredUsers.length === 0 || totalPages <= 1
                            ? "text-gray-400 cursor-not-allowed border-gray-200"
                            : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                        }`}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || filteredUsers.length === 0 || totalPages <= 1}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal de confirmation d'activation/désactivation */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      selectedIsActive ? "bg-red-100" : "bg-green-100"
                    }`}
                  >
                    {selectedIsActive ? (
                      <UserX className="w-8 h-8 text-red-500" />
                    ) : (
                      <UserCheck className="w-8 h-8 text-green-500" />
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedIsActive ? "Désactiver" : "Activer"} l'utilisateur
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir {selectedIsActive ? "désactiver" : "activer"} cet utilisateur ?
                    {selectedIsActive && " Il ne pourra plus accéder à la plateforme."}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={confirmDeactivation}
                      className={`flex-1 px-4 py-3 rounded-lg text-white transition-colors font-medium ${
                        selectedIsActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Detail Modal */}
          {showDetailModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedUserForDetail && getRoleIcon(selectedUserForDetail.role)}
                    Fiche {selectedUserForDetail && getRoleLabel(selectedUserForDetail.role)}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedUserForDetail(null)
                      setDetailProfile(null)
                      setEntites([])
                    }}
                    className="text-white hover:text-gray-200 transition-colors p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {detailLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-gray-600">Chargement...</span>
                    </div>
                  ) : !detailProfile ? (
                    <div className="text-center py-16">
                      <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun profil trouvé</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Profile Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          {/* Photo */}
                          <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-r from-blue-100 to-purple-100">
                              {detailProfile.photo ? (
                                <img
                                  src={`http://127.0.0.1:8000/storage/${detailProfile.photo}`}
                                  alt="Photo de profil"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Mail className="w-16 h-16 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Basic Info */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-bold text-gray-800">{detailProfile.name}</h3>
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleStyle(detailProfile.role)}`}
                              >
                                {selectedUserForDetail && getRoleIcon(selectedUserForDetail.role)}
                                {getRoleLabel(detailProfile.role)}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{detailProfile.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{detailProfile.tel}</span>
                              </div>
                              {detailProfile.ville && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{detailProfile.ville}</span>
                                </div>
                              )}
                              {detailProfile.gouvernement && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{detailProfile.gouvernement}</span>
                                </div>
                              )}
                            </div>

                            {detailProfile.genre && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Genre:</span> {detailProfile.genre}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Entites Section for Proprietaire */}
                      {selectedUserForDetail?.role === "proprietaire" && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-500" />
                            Entités associées ({entites.length})
                          </h4>

                          {entites.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500">Aucune entité associée à ce propriétaire</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {entites.map((entite) => (
                                <div
                                  key={entite.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start gap-4">
                                    {entite.image ? (
                                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img
                                          src={`http://127.0.0.1:8000/storage/${entite.image}`}
                                          alt={entite.nom_entites}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-800 mb-2">{entite.nom_entites}</h5>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {entite.description || "Aucune description"}
                                      </p>
                                      <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        {entite.localisation || "Localisation non spécifiée"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Modifier Utilisateur
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedUserForEdit(null)
                    }}
                    className="text-white hover:text-gray-200 transition-colors p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {editLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-gray-600">Chargement...</span>
                    </div>
                  ) : (
                    <form onSubmit={onSubmitChange} className="space-y-6">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="name"
                            value={userField.name}
                            onChange={changeUserFieldHandler}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.name
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : touched.name && isFieldValid("name")
                                  ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                            placeholder="Entrez le nom"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={userField.email}
                            onChange={changeUserFieldHandler}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.email
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : touched.email && isFieldValid("email")
                                  ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                            placeholder="Entrez l'email"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="tel"
                            value={userField.tel}
                            onChange={changeUserFieldHandler}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.tel
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : touched.tel && isFieldValid("tel")
                                  ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                            placeholder="Entrez le téléphone (8 chiffres)"
                            pattern="\d{8}"
                            title="Le téléphone doit contenir exactement 8 chiffres"
                          />
                        </div>
                        {errors.tel && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            {errors.tel}
                          </p>
                        )}
                      </div>

                      {/* Role Field (Read-only) */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Rôle</label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={getRoleLabel(userField.role)}
                            disabled
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowEditModal(false)}
                          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default UserList