import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css"
import App from './App';
// import StarRating from './StarRating' ;
const root = ReactDOM.createRoot(document.getElementById('root'));

// function Test() {

//   const [movieRating, setMovieRating] = useState(0);

//   return (
//     <div>
//     <StarRating color="blue" onSetRating={setMovieRating} maxRating={10} />
//     <p>This movie is rated {movieRating} on IMDB.</p>
//     </div>
//   );
// }

root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={5} color="red" size={48} messages={["Amazing", "Great", 'Good', "Bad", "Awful"] }/>
    <StarRating color="grey" size={24} className="star-styles"/>
    <Test /> */}
  </React.StrictMode>
);