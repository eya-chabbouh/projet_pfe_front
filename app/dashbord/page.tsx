"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Card = ({ title, value, description }: { title: string, value: number, description: string }) => {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/3 mb-6">
        <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
        <p className="text-4xl font-bold text-indigo-600">{value}</p>
        <p className="text-gray-500">{description}</p>
      </div>
    );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    reservations_count: 0,
    clients_count: 0,
    popular_services: [],
  });

  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/dashboard", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-5 flex flex-col space-y-4">
        <h2 className="text-2xl font-bold mb-4">Menu</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</a>
          <a href="/users" className="block p-2 hover:bg-gray-700 rounded">Utilisateurs</a>
          <a href="/categories" className="block p-2 hover:bg-gray-700 rounded">Catégories</a>
          <a href="/profile" className="block p-2 hover:bg-gray-700 rounded">Profil</a>
          <a href="/settings" className="block p-2 hover:bg-gray-700 rounded">Paramètres</a>
          <button
            onClick={handleLogout}
            className="w-full text-left p-2 hover:bg-red-600 rounded mt-4"
          >
            Déconnexion
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8 relative">
        {/* Admin Profile Section */}
        <div className="absolute top-4 right-4 flex items-center space-x-3 bg-white shadow-md p-3 rounded-lg">
          <Image
            src="/images/admin-icon.png" // Remplace par le chemin de ton image
            alt="Admin Icon"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-gray-800 font-semibold">Admin</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
        
        <div className="flex flex-wrap -mx-4">
          <Card
            title="Nombre de réservations"
            value={dashboardData.reservations_count}
            description="Total des réservations"
          />
          <Card
            title="Nombre de clients"
            value={dashboardData.clients_count}
            description="Clients inscrits"
          />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Services populaires</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <ul className="space-y-4">
              {dashboardData.popular_services.map((service: any, index: number) => (
                <li key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold text-gray-700">{service.nom_entites}</span> {/* Affichage du nom de l'entité */}
                    <p className="text-gray-500">{service.description}</p> {/* Affichage de la description si nécessaire */}
                  </div>
                  <span className="text-gray-500">{service.reservations_count} réservations</span> {/* Affichage du nombre de réservations */}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
