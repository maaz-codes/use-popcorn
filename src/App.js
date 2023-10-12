import { useEffect, useState, useRef } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
// ];

const api_url = 'http://www.omdbapi.com/?apikey=646d154c';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  
  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState();

  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectMovie(movieId) {
    setSelectedMovie(prevId => (
      prevId === movieId ? null : movieId
    ))
  }

  function handleCloseMovieDetails() {
    setSelectedMovie(null);
  }

  function handleAddWatched(newMovie) {
    setWatched(prevMovies => [...prevMovies, newMovie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, newMovie]));
  }
  
  function handleDeleteWatched(id) {
    setWatched(movies => movies.filter(movie => movie.imdbID !== id));
  }

  const {isLoading, error, movies } = useMovies(api_url, query);

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies} />
      </Navbar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} handleSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {
            selectedMovie ? <MovieDetails selectedMovie={selectedMovie} 
              onCloseMovieDetails={handleCloseMovieDetails} 
              handleAddWatched={handleAddWatched}
              watched={watched} 
              /> : <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </> 
          }
        </Box>
      </Main>      
    </>
  ); 
}

function ErrorMessage({ message }) {
  return (
    <p className="error"><span>⛔</span>{message}</p>
  );
}

function Loader() {
  return(
    <p className="loader">Loading...</p>
  );
}

function Button({ setIsOpen, children }) {
  return <button
    className="btn-toggle"
    onClick={() => setIsOpen((open) => !open)}>
    {children}
  </button>
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
          </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery(''); 
  })

  return (
    <input
              className="search"
              type="text"
              placeholder="Search movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              ref={inputEl}
            />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return (
    <main className="main">  
      {children} 
    </main>
  );
}

function Box({ children }) {

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
          <Button setIsOpen={setIsOpen}>{isOpen ? "–" : "+"}</Button>
  
          {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectMovie }) {

  return (
    <ul className="list list-movies">
              {movies?.map((movie) => (
               <Movie movie={movie} key={movie.imdbID} onClick={handleSelectMovie} /> 
              ))}
            </ul>
  );
}

function Movie({ movie, onClick }) {
  return (
    <li key={movie.imdbID} onClick={() => onClick(movie.imdbID)}>
                  <img src={movie.Poster} alt={`${movie.Title} poster`} />
                  <h3>{movie.Title}</h3>
                  <div>
                    <p>
                      <span>🗓</span>
                      <span>{movie.Year}</span>
                    </p>
                  </div>
                </li>
  );
}

function MovieDetails({ selectedMovie, onCloseMovieDetails, handleAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');
  const isWatched = watched.map(movie => movie.imdbID).includes(selectedMovie);
  const watchedUserRating = watched.find(movie => movie.imdbID === selectedMovie)?.userRating;

  const countRatingClicks = useRef(0);

  const {Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre } = movie;

  function onAddWatched() {
      const newWatchedMovie = {
        imdbID: selectedMovie,
        title,
        year,
        poster,
        runtime: Number(runtime.split(' ').at(0)),
        imdbRating: Number(imdbRating),
        userRating,
        countRatingClicks,
    }
      
      handleAddWatched(newWatchedMovie);
      onCloseMovieDetails();
  }

  useEffect(() => {
    if (userRating) countRatingClicks.current++;
  }, [userRating]);

  useEffect(() => {

    async function fetchMovieDetails() {
      setIsLoading(true);
      const response = await fetch(`${api_url}&i=${selectedMovie}`);
      const data = await response.json();
      setMovie(data);
      setIsLoading(false);
    }
    fetchMovieDetails();
  }, [selectedMovie]);

  useEffect(function () {
    if (!title) return
    document.title = `Movie | ${title}`;

    return function () {
      document.title = 'usePopcorn';
    }
  }, [title]);
  
  useKey("Backspace", onCloseMovieDetails);

  return (
    <>
      <div className="details">
        {isLoading ? <Loader /> : <>
        <header>
          <button className="btn-back" onClick={onCloseMovieDetails}>&larr;</button>
          <img src={poster} alt={`Poster of ${movie}`}></img>
          <div className="details-overview">
            <h2>{title}</h2>
            <p>
              {released} &bull; {runtime}
            </p>
            <p>{genre}</p>
            <p><span>⭐</span>{imdbRating} IMDB rating</p>
          </div>
        </header>

        <section>
          <div className="rating">
          {
            !isWatched ? <>
              <StarRating maxRating={10} size={20} onSetRating={setUserRating} />
              {
                userRating > 0 && <button className="btn-add" onClick={onAddWatched}>+ Add to list</button>
              }
            </> : <>
              <p>You already rated this movie with {watchedUserRating}⭐.</p>
            </>
          }
            
          </div>
           
          <p><em>{plot}</em></p>
          <p>Directed by {director}</p>
        </section>
        </>
        }
      </div>
    </>
  );
}

function WatchedSummary({ watched }) {

  const avgImdbRating = Math.round(average(watched.map((movie) => movie.imdbRating)) * 10) / 10;
  const avgUserRating = Math.round(average(watched.map((movie) => movie.userRating)) *10) / 10;
  const avgRuntime = Math.round(average(watched.map((movie) => movie.runtime)) * 10) / 10;

  return (
    <div className="summary">
                <h2>Movies you watched</h2>
                <div>
                  <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                  </p>
                  <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating}</span>
                  </p>
                  <p>
                    <span>🌟</span>
                    <span>{avgUserRating}</span>
                  </p>
                  <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                  </p>
                </div>
              </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return <ul className="list">
                
                {watched.map((movie) => (
                  <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
                ))}
              </ul>
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p> 
          <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>❌</button>
      </div>
    </li>                                                                                          
  );
}