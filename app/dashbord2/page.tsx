"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Doughnut, Bar, Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  ArcElement,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import NavbarProps from "../components/NavbarProps/page"
import {
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  Package,
  Activity,
  X,
  Tag,
  DollarSign,
  Building,
  Calendar,
} from "lucide-react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
)

interface Entite {
  noms_entites: string
  description: string
  localisation: string
  image?: string
}

interface Offre {
  id: number
  titre: string
  description: string
  prix_initial: number
  prix_reduit: number
  reduction: number
  date_debut: string
  date_fin: string
  quantite_initial: number
  image?: string
  image_url?: string
  entite: {
    nom_entites: string
    localisation: string
  }
}

interface CardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  gradient: string
  route: string
}

const Card = ({ title, value, description, icon, gradient, route }: CardProps) => {
  const router = useRouter()

  return (
    <div
      className={`bg-gray-100/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group ${gradient}`}
      onClick={() => router.push(route)}
      role="button"
      aria-label={`View details for ${title}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs font-medium text-gray-600 mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
      </div>
    </div>
  )
}

const OfferModal = ({ offre, isOpen, onClose }: { offre: Offre | null; isOpen: boolean; onClose: () => void }) => {
  if (!isOpen || !offre) return null

  const imageSrc = offre?.image
    ? `http://127.0.0.1:8000/storage/${offre.image}`
    : offre?.image_url
      ? `http://127.0.0.1:8000${offre.image_url}`
      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none'%3E%3Crect width='48' height='48' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-size='12' font-family='Arial'%3EImage%3C/text%3E%3C/svg%3E"

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Détails de l'offre
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-5">
            {/* Image Section */}
            <div className="flex justify-center">
              <img
                src={imageSrc}
                alt={offre.titre}
                className="w-48 h-48 rounded-lg object-cover border border-gray-200 shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none'%3E%3Crect width='48' height='48' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-size='12' font-family='Arial'%3EImage%3C/text%3E%3C/svg%3E"
                }}
              />
            </div>

            {/* Description Section */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-blue-500" />
                Description
              </h4>
              <p className="text-gray-800 text-sm leading-relaxed">
                {offre.description || "Aucune description disponible"}
              </p>
            </div>

            {/* Price Information */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-blue-500" />
                Informations de prix
              </h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-600">Prix initial :</span>{" "}
                  <span className="text-gray-800 font-semibold">{offre.prix_initial} TND</span>
                </p>
                {offre.reduction > 0 && (
                  <p>
                    <span className="font-medium text-gray-600">Réduction :</span>{" "}
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      {offre.reduction}% 
                    </span>
                  </p>
                )}
                <p>
                  <span className="font-medium text-gray-600">Prix final :</span>{" "}
                  <span className="text-green-600 font-bold">{offre.prix_reduit} TND</span>
                </p>
              </div>
            </div>

            {/* Availability Information */}
          <div>
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-blue-500" />
                Disponibilité
              </h4>
              <p className="text-sm">
                <span className="font-medium text-gray-600">Quantité disponible :</span>{" "}
                <span className="text-gray-800 font-semibold">{offre.quantite_initial || "N/A"}</span>
              </p>
            </div>

            {/* Provider Information */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-blue-500" />
                Prestataire
              </h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-600">Nom :</span>{" "}
                  <span className="text-gray-800">{offre.entite?.nom_entites || "N/A"}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-600">Localisation :</span>{" "}
                  <span className="text-gray-800">{offre.entite?.localisation || "N/A"}</span>
                </p>
              </div>
            </div>

            {/* Validity Period */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-500" />
                Période de validité
              </h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-600">Date de début :</span>{" "}
                  <span className="text-gray-800">
                    {offre.date_debut
                      ? new Date(offre.date_debut).toLocaleDateString("fr-TN")
                      : "Non spécifiée"}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-gray-600">Date de fin :</span>{" "}
                  <span className="text-gray-800">
                    {offre.date_fin ? new Date(offre.date_fin).toLocaleDateString("fr-TN") : "Non spécifiée"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<{
    reservations_count: number
    clients_count: number
    popular_services: {
      id?: number
      nom: string
      description: string
      adresse: string
      reservations_count: number
    }[]
  }>({
    reservations_count: 0,
    clients_count: 0,
    popular_services: [],
  })

  const [entites, setEntites] = useState<Entite[]>([])
  const [selectedOffer, setSelectedOffer] = useState<Offre | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingOffer, setLoadingOffer] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }
        const response = await axios.get("http://127.0.0.1:8000/api/entites", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        setEntites(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des entités:", error)
      }
    }

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }
        const response = await axios.get("http://127.0.0.1:8000/api/prop/dashboard2", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Dashboard data:", response.data)
        setDashboardData(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des données dashboard:", error)
      }
    }

    fetchUserData()
    fetchDashboardData()
  }, [router])

  const fetchOfferDetails = async (offerId: number) => {
    setLoadingOffer(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }
      const response = await axios.get(`http://127.0.0.1:8000/api/offres/${offerId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      setSelectedOffer(response.data)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'offre:", error)
    } finally {
      setLoadingOffer(false)
    }
  }

  const handleServiceClick = (service: any) => {
    if (service.id) {
      fetchOfferDetails(service.id)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOffer(null)
  }

  // Doughnut Chart Data
  const doughnutChartData = {
    labels: ["Commandes", "Clients", "Services"],
    datasets: [
      {
        label: "Statistiques",
        data: [dashboardData.reservations_count, dashboardData.clients_count, dashboardData.popular_services.length],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(6, 182, 212, 0.8)", "rgba(37, 99, 235, 0.8)"],
        borderColor: ["rgb(59, 130, 246)", "rgb(6, 182, 212)", "rgb(37, 99, 235)"],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }

  // Stacked Bar Chart Data
  const stackedBarChartData = {
    labels: ["Statistiques"],
    datasets: [
      {
        label: "Clients",
        data: [dashboardData.clients_count],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Commandes",
        data: [dashboardData.reservations_count],
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderColor: "rgb(37, 99, 235)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  // Radar Chart Data
  const radarChartData = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
    datasets: [
      {
        label: "Réservations",
        data: [10, 20, 15, 30, 25, 40],
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#f3f4f6",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 500,
          },
          color: "#374151",
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleFont: { size: 12, family: "'Inter', sans-serif", weight: 600 },
        bodyFont: { size: 11, family: "'Inter', sans-serif" },
        cornerRadius: 6,
        padding: 8,
      },
    },
    scales: {
      r: {
        angleLines: { color: "rgba(156, 163, 175, 0.3)" },
        grid: { color: "rgba(156, 163, 175, 0.3)" },
        pointLabels: { font: { size: 10, family: "'Inter', sans-serif" }, color: "#374151" },
        ticks: { backdropColor: "transparent", color: "#6B7280", font: { size: 9 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(156, 163, 175, 0.2)" },
        ticks: { color: "#6B7280", font: { size: 10 } },
      },
      x: {
        grid: { color: "rgba(156, 163, 175, 0.2)" },
        ticks: { color: "#6B7280", font: { size: 10 } },
      },
    },
  }

  const cardRoutes = {
    "Nombre de réservations": "/res_prop",
    "Nombre de clients": "/res_prop/res_clientprop",
  }

  return (
    <NavbarProps>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
           <div className="mb-6">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                             <BarChart3 className="w-5 h-5 text-white" />
                           </div>
                           <div>
                             <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                               Tableau de Bord
                             </h1>
                             <p className="text-gray-600 text-sm">Vue d'ensemble de votre plateforme</p>
                           </div>
                         </div>
                       </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card
                title="Commandes"
                value={dashboardData.reservations_count}
                description="Total des commandes"
                icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
                gradient="hover:border-blue-200"
                route={cardRoutes["Nombre de réservations"]}
              />
              <Card
                title="Clients"
                value={dashboardData.clients_count}
                description="Clients ayant commandé"
                icon={<Users className="w-5 h-5 text-blue-600" />}
                gradient="hover:border-blue-200"
                route={cardRoutes["Nombre de clients"]}
              />
            </div>

            {/* Popular Services */}
            {dashboardData.popular_services.length > 0 && (
              <div className="mb-6">
                <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Services Populaires
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.popular_services.map((service, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                          onClick={() => handleServiceClick(service)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              {loadingOffer ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Package className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{service.nom}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                              <p className="text-xs text-gray-500 mb-2">📍 {service.adresse}</p>
                              <div className="text-sm font-medium text-blue-600">
                                {service.reservations_count} commande{service.reservations_count > 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Doughnut Chart */}
              <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Répartition des Statistiques
                  </h3>
                </div>
                <div className="p-4 h-64">
                  <Doughnut data={doughnutChartData} options={chartOptions} />
                </div>
              </div>

              {/* Stacked Bar Chart */}
              <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Comparaison Clients/Commandes
                  </h3>
                </div>
                <div className="p-4 h-64">
                  <Bar
                    data={stackedBarChartData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: "top" as const,
                        },
                      },
                      scales: {
                        ...chartOptions.scales,
                        x: {
                          ...chartOptions.scales.x,
                          stacked: true,
                        },
                        y: {
                          ...chartOptions.scales.y,
                          stacked: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Radar Chart */}
              <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Tendances des Réservations
                  </h3>
                </div>
                <div className="p-4 h-64">
                  <Radar data={radarChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Offer Modal */}
            <OfferModal offre={selectedOffer} isOpen={isModalOpen} onClose={closeModal} />
          </div>
        </div>
      </div>
    </NavbarProps>
  )
}

export default Dashboard