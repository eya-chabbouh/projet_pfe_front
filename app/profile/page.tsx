"use client"; // Ensure this file is treated as a client component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import "../profile/styles.css"; // Import the CSS file here

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Fetch the user data with authentication token
  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        return;
      }

      const response = await axios.get("http://localhost:8000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token for authentication
        },
      });

      console.log("User data:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Error loading profile data:", error);
      setError("Failed to load profile data.");
    }
  };

  useEffect(() => {
    fetchProfileData(); // Fetch data once component mounts
  }, []); // Empty dependency array means it will run only once

  if (error) return <div className="error">{error}</div>; // Handle error state gracefully

  // If user data is null, render a placeholder
  if (!user) return null; // Optionally, render nothing or a placeholder here

  return (
    <div className="profile-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <h2>MyApp</h2>
        </div>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/profile">Profil</Link>
          </li>
        </ul>
      </div>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-photo-container">
            <img
              src={user?.photo || "/default-avatar.png"} // Fallback to default avatar if no photo
              alt="User Photo"
              className="profile-photo"
            />
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="email">{user?.email}</p>
            <div className="buttons">
              <button onClick={() => {}} className="action-button">
                Favoris
              </button>
              <button onClick={() => {}} className="action-button">
                Mes Points
              </button>
            </div>
          </div>
        </div>

        <div className="profile-links">
          <Link href="/edit-profile" className="profile-link">
            Éditer mes informations personnelles
          </Link>
          <Link href="/edit-categories" className="profile-link">
            Modifier mes catégories
          </Link>
          <Link href="/contact-us" className="profile-link">
            Contacter-nous
          </Link>
          <Link href="/delete-account" className="profile-link danger">
            Supprimer mon compte
          </Link>
          {/* Move the Deconnexion button below the other links */}
          <button onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/login"); // Redirect to login page
          }} className="profile-link danger logout-btn">
            Deconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;