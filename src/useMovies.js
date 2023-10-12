import { useState, useEffect } from "react";

export function useMovies(api_url, query) {
    const [movies, setMovies] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("")

    useEffect( () => {
        const controller = new AbortController();
    
        async function fetchMovies() {
          try {
            setError('');
            const response = await fetch(`${api_url}&s=${query}`, { signal: controller.signal });
            
            if (!response.ok) throw new Error("Something went wrong with fetching movies");
          
            const data = await response.json();
          
            if (data.Response === 'False') throw new Error("Movies not found!");
      
            setMovies(data.Search);
            setError('');
            
          } catch (err) {
            console.error(err.message);
    
            if(err.name !== "AbortError") {
              setError(err.message);
            }
      
          } finally {
            setIsLoading(false);   
          }   
        }
    
        if(query.length < 3) {
          setMovies([]);
          setError('');
          setIsLoading(false);
          return;
        }
    
        // handleCloseMovieDetails();
        fetchMovies();
    
        return function () {
          controller.abort();
        }
    
      }, [api_url, query]);

      return {isLoading, error, movies};
}
