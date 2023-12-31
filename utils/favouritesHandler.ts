// Get all favourites from local storage
export const getFavourites = (): Events[] => {
  if (localStorage === undefined) {
    return [];
  }

  const favourites = localStorage.getItem('favourites');
  if (favourites) {
    return JSON.parse(favourites);
  }
  return [];
};

// Add a favourite to local storage
export const addFavourite = (favourite: Events) => {
  const favourites = getFavourites();
  favourites.push(favourite);
  localStorage.setItem('favourites', JSON.stringify(favourites));
};

// Remove a favourite from local storage
export const removeFavourite = (favourite: Events) => {
  const favourites = getFavourites();
  const newFavourites = favourites.filter((f: Events) => f.id !== favourite.id);
  localStorage.setItem('favourites', JSON.stringify(newFavourites));
};
