// frontend/src/components/Banner.jsx
import React, { useEffect, useState } from 'react';
import { movieApi } from '../../api/movieApi';

const Banner = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchNowShowing = async () => {
      try {
        const data = await movieApi.getNowShowing();
        setMovies(data);
      } catch (error) {
        console.error('Lỗi khi tải phim đang chiếu:', error);
      }
    };

    fetchNowShowing();
  }, []);

  return (
    <div className="banner">
      {movies.map(movie => (
        <div key={movie.id} className="banner-item">
          <img src={movie.posterUrl} alt={movie.title} />
          <h3>{movie.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default Banner;
