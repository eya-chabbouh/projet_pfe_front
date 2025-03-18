import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const CallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { code } = router.query;

      if (code) {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/auth/google/callback?code=${code}`);
          console.log(response.data); // Handle the response from your backend
          // Redirect to a user dashboard or other page after successful login
        } catch (error) {
          console.error('Error fetching Google user:', error);
        }
      }
    };

    fetchUserData();
  }, [router.query]);

  return <div>Loading...</div>;
};

export default CallbackPage;
