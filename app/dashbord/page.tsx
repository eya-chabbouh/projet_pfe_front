"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import AdminLayout from "../components/AdminLayout/page"
import { Pie, Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  ArcElement,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Users, ShoppingCart, CheckCircle, Clock, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend)

interface Reservation {
  id: number
  prix: string
  statut: string
  offre: { titre: string }
  entite: { nom_entites: string }
}

interface Client {
  id: number
  name: string
  reservations: Reservation[]
}

interface CardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  gradient: string
  route: string
}

const Card: React.FC<CardProps> = ({ title, value, description, icon, gradient, route }) => {
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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<{
    reservations_count: number
    clients_count: number
    clients_with_confirmed_reservations_count: number
    popular_services: any[]
    client_reservations: Client[]
    pending_entites_count?: number
    accepted_entites_count?: number
    monthly_reservations?: number[]
  }>({
    reservations_count: 0,
    clients_count: 0,
    clients_with_confirmed_reservations_count: 0,
    popular_services: [],
    client_reservations: [],
    pending_entites_count: 0,
    accepted_entites_count: 0,
    monthly_reservations: [0, 0, 0, 0, 0, 0],
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://127.0.0.1:8000/api/dashboard", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        setDashboardData({
          ...response.data,
          monthly_reservations: response.data.monthly_reservations || [10, 20, 15, 30, 25, 40],
        })
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error)
      }
    }
    fetchDashboardData()
  }, [])

  const chartData = {
    labels: ["Commandes", "Clients", "Services"],
    datasets: [
      {
        label: "Statistiques",
        data: [dashboardData.reservations_count, dashboardData.clients_count, dashboardData.popular_services.length],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(6, 182, 212, 0.8)", "rgba(156, 163, 175, 0.9)"],
        borderColor: ["rgb(59, 130, 246)", "rgb(6, 182, 212)", "rgb(107, 114, 128)"],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }

  const barChartData = {
    labels: ["Clients", "Commandes"],
    datasets: [
      {
        label: "Nombre",
        data: [dashboardData.clients_count, dashboardData.reservations_count],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(59, 130, 246, 0.8)"],
        borderColor: ["rgb(59, 130, 246)", "rgb(59, 130, 246)"],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const lineChartData = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
    datasets: [
      {
        label: "Réservations Mensuelles",
        data: dashboardData.monthly_reservations || [10, 20, 15, 30, 25, 40],
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#f3f4f6",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 10,
            family: "'Inter', sans-serif",
          },
        },
      },
      x: {
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 10,
            family: "'Inter', sans-serif",
          },
        },
      },
    },
  }

  const pieOptions = {
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
          padding: 12,
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
  }

  const cardRoutes = {
    Commandes: "/res/total",
    Clients: "/res",
    "Clients Actifs": "/res",
    "En Attente": "/demande_prop",
    Acceptées: "/demande_prop",
  }

  return (
    <AdminLayout>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <Card
                title="Commandes"
                value={dashboardData.reservations_count}
                description="Total des commandes"
                icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
                gradient="hover:border-blue-200"
                route={cardRoutes["Commandes"]}
              />
              <Card
                title="Clients"
                value={dashboardData.clients_count}
                description="Clients inscrits"
                icon={<Users className="w-5 h-5 text-blue-600" />}
                gradient="hover:border-blue-200"
                route={cardRoutes["Clients"]}
              />
              <Card
                title="Clients Actifs"
                value={dashboardData.clients_with_confirmed_reservations_count}
                description="Avec commandes"
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                gradient="hover:border-green-200"
                route={cardRoutes["Clients Actifs"]}
              />
              <Card
                title="En Attente"
                value={dashboardData.pending_entites_count || 0}
                description="Demandes à traiter"
                icon={<Clock className="w-5 h-5 text-orange-600" />}
                gradient="hover:border-orange-200"
                route={cardRoutes["En Attente"]}
              />
              <Card
                title="Acceptées"
                value={dashboardData.accepted_entites_count || 0}
                description="Demandes traitées"
                icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                gradient="hover:border-emerald-200"
                route={cardRoutes["Acceptées"]}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Pie Chart */}
              <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Statistiques Globales
                  </h3>
                </div>
                <div className="p-4">
                  <div style={{ height: "200px" }}>
                    <Pie data={chartData} options={pieOptions} />
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Clients vs Commandes
                  </h3>
                </div>
                <div className="p-4">
                  <div style={{ height: "200px" }}>
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Line Chart */}
              <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Évolution Mensuelle
                  </h3>
                </div>
                <div className="p-4">
                  <div style={{ height: "200px" }}>
                    <Line data={lineChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard