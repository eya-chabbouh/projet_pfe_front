"use client"; // Ensure this file is treated as a client component

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Use next/navigation for routing in Next.js 13+
import "./styles.css"; // Ensure the correct CSS file path

const EditProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<any>({
    name: "",
    lname: "", // Add last name
    email: "",
    photo: "",
    dob: "", // Date of birth
    telephone: "", // Telephone
    genre: "", // Genre (Homme ou Femme)
    gouvernorat: "", // Gouvernorat
    ville: "", // Ville
  });

  const [cities, setCities] = useState<string[]>([]); // Cities based on Gouvernorat selection

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setFormData({
          name: response.data.name || "",
          lname: response.data.lname || "", // Last name
          email: response.data.email || "",
          photo: response.data.photo || "",
          dob: response.data.dob || "", // Date of birth
          telephone: response.data.telephone || "", // Telephone
          genre: response.data.genre || "", // Genre
          gouvernorat: response.data.gouvernorat || "", // Gouvernorat
          ville: response.data.ville || "", // Ville
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data.");
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        return;
      }

      await axios.patch(
        "http://localhost:8000/api/user",
        {
          name: formData.name,
          lname: formData.lname,
          email: formData.email,
          photo: formData.photo,
          dob: formData.dob,
          telephone: formData.telephone,
          genre: formData.genre,
          gouvernorat: formData.gouvernorat,
          ville: formData.ville,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      alert("Profile updated successfully!");
      router.push("/profile");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "gouvernorat") {
      // Update cities based on gouvernorat
      setCities(getCitiesForGouvernorat(e.target.value));
    }
  };

  // Example function to return cities based on gouvernorat (you should implement this with actual data)
  const getCitiesForGouvernorat = (gouvernorat: string): string[] => {
    const citiesMap: { [key: string]: string[] } = {
      "Tunis": ["Tunis", "La Marsa", "Carthage"],
      "Sfax": ["Sfax", "Kerkennah"],
      // Add more governorates and cities here
    };
    return citiesMap[gouvernorat] || [];
  };

  if (error) return <div className="error">{error}</div>;

  if (!user) return null; // Render nothing or a placeholder until user data is fetched

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2>Edit Profile</h2>

        {formData.photo && <img src={formData.photo} alt="Profile" className="profile-image" />}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="lname">Last Name</label>
            <input type="text" id="lname" name="lname" value={formData.lname} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date de Naissance</label>
            <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Telephone</label>
            <input type="text" id="telephone" name="telephone" value={formData.telephone} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <select id="genre" name="genre" value={formData.genre} onChange={handleInputChange}>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="gouvernorat">Gouvernorat</label>
            <select id="gouvernorat" name="gouvernorat" value={formData.gouvernorat} onChange={handleInputChange}>
              <option value="Tunis">Tunis</option>
              <option value="Sfax">Sfax</option>
              {/* Add other governorates here */}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ville">Ville</label>
            <select id="ville" name="ville" value={formData.ville} onChange={handleInputChange}>
              {cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="update-button">Modifier</button>
          <button type="button" className="cancel-button" onClick={() => router.push("/profile")}>Annuler</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;