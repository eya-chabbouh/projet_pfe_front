"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    message: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Tu peux récupérer le token depuis localStorage ou un context
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setError("Vous devez être connecté pour envoyer une réclamation.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/reclamations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Réclamation envoyée avec succès !");
        setFormData({ nom: "", email: "", message: "" }); // Reset form
      } else {
        setError(data.message || "Une erreur s'est produite.");
      }
    } catch (err) {
      setError("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
       <Link href="/client">
          <button className="mt-4 text-blue-500 hover:text-blue-700 transition duration-200"> Retour </button>
        </Link>
      <div className="alert alert-primary text-center fw-bold" role="alert">
        🎉 Économisez 15 % ! Contactez-nous maintenant !
      </div>

      <div className="text-center">
        <h2 className="fw-bold">Contact</h2>
        <p className="text-muted">Besoin d'aide ? Contactez-nous.</p>
      </div>

      <div className="row text-center my-4">
        <div className="col-md-6">
          <h5>📞 Appelez-nous</h5>
          <p className="fw-bold">+216 22 487 777</p>
        </div>
        <div className="col-md-6">
          <h5>📧 Envoyez-nous un courriel</h5>
          <p className="fw-bold">contact@gmail.com</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nom" className="form-label">Nom</label>
              <input
                type="text"
                className="form-control"
                id="nom"
                name="nom"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="Votre e-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                rows={4}
                placeholder="Votre message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Envoi en cours..." : "Soumettre"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
