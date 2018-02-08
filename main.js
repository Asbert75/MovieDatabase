window.onload = function() {
    const db = firebase.database();
    const movieList = document.getElementById("movieList");

    const loader = document.getElementById("loader");

    const addMovieButton = document.getElementsByClassName("addMovieButton")[0];
    const submitMovie = document.getElementsByClassName("submitMovie")[0];
    const addMovieForm = document.getElementsByClassName("addMovie")[0];
    const closeAddMovieForm = document.getElementById("closeAddMovieForm");
    const cover = document.getElementById("cover");

    const pagination = document.getElementById("pagination");
    const nextPage = document.getElementById("nextPage");
    const prevPage = document.getElementById("prevPage");

    const firstChoice = document.getElementById("firstChoice");
    const secondChoice = document.getElementById("secondChoice");
    const thirdChoice = document.getElementById("thirdChoice");
    const fourthChoice = document.getElementById("fourthChoice");
    const fifthChoice = document.getElementById("fifthChoice");

    let movies = new Array;

    let page = 1;
    let moviesPerPage = 8;

    function getMoviesFromDatabase() {
        db.ref("movies/").on("child_added", function(snapshot) {
            let data = snapshot.val();
            let key = snapshot.key;

            let movieData = {
                title: data.title,
                director: data.director,
                premiere: data.premiere,
                thumbnail: data.thumbnail,
                id: key,
                };

            movies.push(movieData);

            displayMovies(moviesPerPage);
            loader.classList.add("hidden");
            pagination.classList.remove("hidden");
        });
    }

    function displayMovies(count) {
        movieList.innerHTML = "";

        for(let i = ((page - 1) * moviesPerPage); i < (page*moviesPerPage); i++) {
            if(movies[i]) {
                renderMovie(movies[i].id, i, movies[i].title, movies[i].director, movies[i].premiere, movies[i].thumbnail);
            }
        }
    }

    function renderMovie(id, loc, movieTitle, movieDirector, moviePremiere, movieThumbnail) {
        let movie = document.createElement("div");
        movie.classList.add("movie");
        movie.setAttribute("data-id", id);
        movie.setAttribute("data-loc", loc);

        let remove = document.createElement("a");
        remove.classList.add("close");
        remove.classList.add("hidden");
        remove.href="#";
        remove.innerHTML = "<i class='fas fa-times'></i> Remove";

        let thumbnail = document.createElement("img");
        thumbnail.classList.add("thumbnail");
        thumbnail.src = movieThumbnail;
        thumbnail.setAttribute("onerror", "this.src='thumbnails/fallback.png'");

        let title = document.createElement("h3");
        title.classList.add("title");
        title.innerText = movieTitle;

        let director = document.createElement("p");
        director.classList.add("director");
        director.innerHTML = "<span class='info'>Directed by </span>";
        director.innerHTML += movieDirector;

        let premiere = document.createElement("p");
        premiere.classList.add("premiere");
        premiere.innerHTML = "<span class='info'>Premiere </span>";
        premiere.innerHTML += moviePremiere;

        movie.appendChild(remove);
        movie.appendChild(thumbnail);
        movie.appendChild(title);
        movie.appendChild(director);
        movie.appendChild(premiere);

        movie.addEventListener("mouseover", function() {
            remove.classList.remove("hidden");
        });

        movie.addEventListener("mouseleave", function() {
            remove.classList.add("hidden");
        })

        remove.addEventListener("click", function(event) {
            event.preventDefault();

            movies.splice(loc, 1);

            db.ref("movies/" + id).ref.remove()
            .then(function() {
                console.log("movies/", id, " deleted");
            })
            .catch(function(error) {
                console.log("Error removing movie! Error: ", error);
            });
            
            displayMovies(moviesPerPage);
        })

        movieList.appendChild(movie);
    }

    function changeNumbers() {
        firstChoice.classList.remove("hide");
        secondChoice.classList.remove("hide");
        thirdChoice.classList.remove("hide");
        fourthChoice.classList.remove("hide");
        fifthChoice.classList.remove("hide");

        if((page - 1) <= 0) {
            firstChoice.classList.add("hide");
            secondChoice.classList.add("hide");
        }
        else if((page - 2) <= 0) {
            firstChoice.classList.add("hide");
        }
        else if(page == Math.ceil(movies.length/moviesPerPage)) {
            fourthChoice.classList.add("hide");
            fifthChoice.classList.add("hide");
        }
        else if(page == Math.ceil(movies.length/moviesPerPage) - 1 ) {
            fifthChoice.classList.add("hide");
        }

        firstChoice.innerText = (page - 2);
        secondChoice.innerText = (page - 1);
        thirdChoice.innerText = page;
        fourthChoice.innerText = (page + 1);
        fifthChoice.innerText = (page + 2);         
    }

    function disableButtons() {
        // Can't go to page 0, so disable previous page.
        if(page == 1) {
            prevPage.classList.add("disabled");
        }
        // Can go back to page 1 again, so enable it.
        else if(page == 2) {
            prevPage.classList.remove("disabled");
        }
        // If you've reached the last page, disable next page.
        else if(page == Math.ceil(movies.length/moviesPerPage)) {
            nextPage.classList.add("disabled");
        }
        // If you go back, enable next page again.
        else if(page <= Math.ceil(movies.length/moviesPerPage) - 1) {
            nextPage.classList.remove("disabled");
        }
    }

    function showNextPage() {
        let pages = document.getElementById("pages");

        page += 1;

        disableButtons();

        changeNumbers();
        movieList.innerHTML = "";
        displayMovies(moviesPerPage);
    }

    function showPreviousPage() {
        let pages = document.getElementById("pages");

        page -= 1;

        disableButtons();

        changeNumbers();
        movieList.innerHTML = "";
        displayMovies(moviesPerPage);
    }

    function addMovie() {
        let title = document.getElementById("titleSubmit");
        let premiere = document.getElementById("premiereSubmit");
        let director = document.getElementById("directorSubmit");
        let thumbnail = document.getElementById("thumbnailSubmit");

        if(!title.value || !premiere.value || !director.value || !thumbnail.value) {
            if(!title.value && !title.nextElementSibling.className.includes("error")) {
                title.insertAdjacentHTML("afterend", "<p class='error'>*Field must have a value.</p>");
            }

            if(!premiere.value && !premiere.nextElementSibling.className.includes("error")) {
                premiere.insertAdjacentHTML("afterend", "<p class='error'>*Field must have a value.</p>");
            }

            if(!director.value && !director.nextElementSibling.className.includes("error")) {
                director.insertAdjacentHTML("afterend", "<p class='error'>*Field must have a value.</p>");
            }

            if(!thumbnail.value && !thumbnail.nextElementSibling.className.includes("error")) {
                thumbnail.insertAdjacentHTML("afterend", "<p class='error'>*Field must have a value.</p>");
            }
        }
        else {
            let errors = document.getElementsByClassName("error");

            while(errors.length > 0) {
                errors[errors.length-1].parentNode.removeChild(errors[errors.length-1]);
            }

            let data = {
                title: title.value,
                director: director.value,
                premiere: premiere.value,
                thumbnail: thumbnail.value
            };

            db.ref("movies/").push(data);

            thumbnail.value = "";
            title.value = "";
            director.value = "";
            premiere.value = "";

            displayMovies();
            addMovieForm.insertAdjacentHTML("afterbegin", "<span id='success' class='success'>Movie added to database</span>");
            setTimeout(function() {
                document.getElementById("success").parentNode.removeChild(document.getElementById("success"));
                addMovieForm.classList.add("hidden");
                cover.classList.add("hidden");
            }, 2000);
        }
    }

    function clearInputErrors() {
        let errors = document.getElementsByClassName("error");

        while(errors.length > 0) {
            errors[errors.length-1].parentNode.removeChild(errors[errors.length-1]);
        }
    }

    function search(query) {

    }

    nextPage.addEventListener("click", function(event) {
        event.preventDefault(); 
        showNextPage(); 
    });
    prevPage.addEventListener("click", function(event) { 
        event.preventDefault(); 
        showPreviousPage(); 
    });

    addMovieButton.addEventListener("click", function(event) {
        event.preventDefault();
        addMovieForm.classList.remove("hidden");
        cover.classList.remove("hidden");
        clearInputErrors();
    });

    closeAddMovieForm.addEventListener("click", function(event) {
        event.preventDefault();
        addMovieForm.classList.add("hidden");
        cover.classList.add("hidden");
        clearInputErrors();
    })

    submitMovie.addEventListener("click", function(event) {
        event.preventDefault();
        addMovie();
    });

    cover.addEventListener("click", function() {
        cover.classList.add("hidden");
        addMovieForm.classList.add("hidden");
    })

    firstChoice.addEventListener("click", function(event) {
        event.preventDefault();
        showPreviousPage();
        showPreviousPage();
    });

    secondChoice.addEventListener("click", function(event) {
        event.preventDefault();
        showPreviousPage();
    });

    thirdChoice.addEventListener("click", function(event) {
        event.preventDefault();
    });

    fourthChoice.addEventListener("click", function(event) {
        event.preventDefault();
        showNextPage();
    });

    fifthChoice.addEventListener("click", function(event) {
        event.preventDefault();
        showNextPage();
        showNextPage();
    });
    
    getMoviesFromDatabase();
}