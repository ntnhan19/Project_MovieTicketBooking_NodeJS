// admin/src/pages/Movies.jsx
import React from 'react';
import MovieList from '../components/Movies/MovieList';
import MovieCreate from '../components/Movies/MovieCreate';

const Movies = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý phim</h1>
      <MovieList />
      <div className="mt-6">
        <MovieCreate />
      </div>
    </div>
  );
};

export default Movies;
