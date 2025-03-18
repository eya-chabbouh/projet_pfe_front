"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout/page";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

interface CardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: string;
  color: string;
}
const Card: React.FC<CardProps> = ({ title, value, description, icon, color }) => {
  return (
    <div className="col-xl-3 col-md-6 mb-4">
      <div className={`card border-left-${color} shadow h-100 py-2`}>
        <div className="card-body">
          <div className="row no-gutters align-items-center">
            <div className="col mr-2">
              <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>{title}</div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">{value}</div>
              <div className="text-gray-500">{description}</div>
            </div>
            <div className="col-auto">
              <i className={`fas ${icon} fa-2x text-gray-300`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    reservations_count: 0,
    clients_count: 0,
    popular_services: [],
  });
  

    
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

  return (
    <AdminLayout>
      <div className="container-fluid">
        <h1 className="h3 mb-4 text-gray-800">Dashboard</h1>

        <div className="row">
          <Card title="Nombre de réservations" value={dashboardData.reservations_count} description="Total des réservations" icon="fa-calendar" color="primary" />
          <Card title="Nombre de clients" value={dashboardData.clients_count} description="Clients inscrits" icon="fa-users" color="success" />
          <Card title="Tasks" value="50%" description="Completed Tasks" icon="fa-clipboard-list" color="info" />
          <Card title="Pending Requests" value="18" description="Pending Approvals" icon="fa-comments" color="warning" />
        </div>

        <div className="row">
          <Card title="Total Sales" value="$1k" description="Last day +8%" icon="fa-dollar-sign" color="success" />
          <Card title="Total Order" value="300" description="Last day +5%" icon="fa-shopping-cart" color="primary" />
          <Card title="Sold" value="5" description="Last day +1.2%" icon="fa-chart-line" color="info" />
          <Card title="Customers" value="8" description="Last day +0.5%" icon="fa-user" color="warning" />
        </div>

        <div className="row">
          <div className="col-xl-8 col-lg-7">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Earnings Overview</h6>
              </div>
              <div className="card-body">
                <Line data={{ labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], datasets: [{ label: "Earnings", data: [40000, 45000, 38000, 50000, 60000, 70000], borderColor: "#4e73df", backgroundColor: "rgba(78, 115, 223, 0.2)", tension: 0.3 }] }} />
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-5">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Revenue Sources</h6>
              </div>
              <div className="card-body">
                <Pie data={{ labels: ["Direct", "Social", "Referral"], datasets: [{ data: [55, 30, 15], backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"], hoverBackgroundColor: ["#2e59d9", "#17a673", "#2c9faf"] }] }} />
              </div>
            </div>
          </div>
        </div>

        {/* Ajout des nouveaux graphiques */}
        <div className="row">
          <div className="col-xl-6">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Revenu Total</h6>
              </div>
              <div className="card-body">
                <Bar data={{ labels: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], datasets: [{ label: "Online Sales", data: [200, 450, 300, 500, 700], backgroundColor: "#3f51b5" }, { label: "Offline Sales", data: [150, 300, 200, 400, 600], backgroundColor: "#4caf50" }] }} />
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Satisfaction des Clients</h6>
              </div>
              <div className="card-body">
                <Line data={{ labels: ["Jan", "Fév", "Mar", "Avr", "Mai"], datasets: [{ label: "Dernier Mois", data: [70, 75, 72, 78, 80], borderColor: "#1e88e5", fill: false }, { label: "Ce Mois-ci", data: [65, 68, 70, 72, 74], borderColor: "#ff9800", fill: false }] }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;