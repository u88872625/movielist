const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
let filteredMovies = [];
const MOVIES_PER_PAGE = 12;
let currentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modeChangeSwitch = document.querySelector("#change-mode");

function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    let rawHTML = "";

    data.forEach((item) => {
      // title,image
      console.log(item);
      rawHTML += `
    <div class="col-sm-3">
    <div class="mt-2">
      <div class="card">
        <img
          src="${POSTER_URL + item.image}"
          class="card-img-top"
          alt="Movie Poster"
        />
        <div class="card-body">
          <p class="card-text">${item.title}</p>
        </div>
        <div class="card-footer text-muted">
          <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id="${item.id}"
          >
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${
            item.id
          }">+</button>
        </div>
      </div>
    </div>
  </div>
    
    `;
    });

    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = `<ul class="list-group col-sm-12 mb-2">`;
    data.forEach((item) => {
      // title, image, id
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>`;
    });
    rawHTML += "</ul>";
    dataPanel.innerHTML = rawHTML;
  }
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
        <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
        `;
  }

  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const starIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(starIndex, starIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  modalTitle.innerText = "";
  modalImage.innerHTML = "";
  modalDate.innerText = "";
  modalDescription.innerText = "";

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalImage.innerHTML = `<img
    src="${POSTER_URL + data.image}"
    alt="movie-poster"
    class="image-fluid"
  />`;
    modalDate.innerText = "release date: " + data.release_date;
    modalDescription.innerText = data.description;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經收藏過了！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode;
}

modeChangeSwitch.addEventListener("click", function onSwitchClicked(event) {
  if (event.target.matches("#card-mode-button")) {
    changeDisplayMode("card-mode");
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches("#list-mode-button")) {
    changeDisplayMode("list-mode");
    renderMovieList(getMoviesByPage(currentPage));
  }
});

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  currentPage = page;

  renderMovieList(getMoviesByPage(currentPage));
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert("Not found:" + keyword);
  }

  currentPage = 1;

  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(currentPage));
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    console.log(movies);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage));
  })
  .catch((err) => console.log(err));
