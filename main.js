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

    const searchInput = document.getElementById("searchInput");
    const sorting = document.getElementById("sorting");
    const order = document.getElementById("order");

    let movies = new Array;
    let results = new Array;

    let page = 1;
    let moviesPerPage = 8;

    db.ref("movies/").on("child_changed", function(snapshot) {
        let data = snapshot.val();
        let key = snapshot.key;

        let movieData = {
            title: data.title,
            director: data.director,
            premiere: data.premiere,
            thumbnail: data.thumbnail,
            id: key,
        };

        let card = document.querySelector("div[data-id='" + key + "'");
        movies[card.getAttribute("data-loc")] = movieData;
        results = movies;
        displayMovies(moviesPerPage);
    });

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
            results = movies;

            displayMovies(moviesPerPage);
            loader.classList.add("hidden");
            pagination.classList.remove("hidden");
        });
    }

    function displayMovies(count) {
        movieList.innerHTML = "";
        sortMovies();

        for(let i = ((page - 1) * moviesPerPage); i < (page*moviesPerPage); i++) {
            if(results[i]) {
                renderMovie(results[i].id, i, results[i].title, results[i].director, results[i].premiere, results[i].thumbnail);
            }
        }
    }

    function renderMovie(id, loc, movieTitle, movieDirector, moviePremiere, movieThumbnail) {
        let movie = document.createElement("div");
        movie.classList.add("movie");
        movie.setAttribute("data-id", id);
        movie.setAttribute("data-loc", loc);

        let edit = document.createElement("a");
        edit.classList.add("edit");
        edit.classList.add("hidden");
        edit.href = "#";
        edit.innerHTML = "<i class='fas fa-edit'></i> Edit";

        let remove = document.createElement("a");
        remove.classList.add("close");
        remove.classList.add("hidden");
        remove.href = "#";
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
        let directorInfo = document.createElement("span");
        directorInfo.classList.add("info");
        directorInfo.innerText = "Directed by ";
        let directorText = document.createElement("span");
        directorText.classList.add("directorSpan");
        directorText.innerText = movieDirector;
        director.appendChild(directorInfo);
        director.appendChild(directorText);

        let premiere = document.createElement("p");
        premiere.classList.add("premiere");
        let premiereInfo = document.createElement("span");
        premiereInfo.classList.add("info");
        premiereInfo.innerText = "Premiere ";
        let premiereText = document.createElement("span");
        premiereText.classList.add("premiereSpan");
        premiereText.innerText = moviePremiere;
        premiere.appendChild(premiereInfo);
        premiere.appendChild(premiereText);
        
        movie.appendChild(edit);
        movie.appendChild(remove);
        movie.appendChild(thumbnail);
        movie.appendChild(title);
        movie.appendChild(director);
        movie.appendChild(premiere);

        movie.addEventListener("mouseover", function() {
            remove.classList.remove("hidden");
            edit.classList.remove("hidden");
        });

        movie.addEventListener("mouseleave", function() {
            remove.classList.add("hidden");
            edit.classList.add("hidden");
        });

        remove.addEventListener("click", function(event) {
            event.preventDefault();

            movies.splice(loc, 1);
            results = movies;

            db.ref("movies/" + id).ref.remove()
            .then(function() {
                console.log("movies/", id, " deleted");
            })
            .catch(function(error) {
                console.log("Error removing movie! Error: ", error);
            });
            
            displayMovies(moviesPerPage);
        });

        edit.addEventListener("click", function(event) {
            event.preventDefault();
            edit.classList.add("disabled");

            let cancelEdits = document.createElement("a");
            cancelEdits.classList.add("cancelEdits");
            cancelEdits.href = "#";
            cancelEdits.innerHTML = "<i class='fas fa-times-circle'></i>";
            cancelEdits.innerHTML += " Cancel";

            let submitEdits = document.createElement("a");
            submitEdits.classList.add("submitEdits");
            submitEdits.href = "#";
            submitEdits.innerHTML = "<i class='fas fa-check-circle'></i>";
            submitEdits.innerHTML += " Submit Changes";

            let name = document.createElement("h3");
            name.innerText = "Edit Movie";
            name.classList.add("editMovie");
            
            let headers = new Array;
            headers[0] = document.createElement("p");
            headers[1] = document.createElement("p");
            headers[2] = document.createElement("p");
            headers[3] = document.createElement("p");

            headers[0].innerText = "Title";
            headers[1].innerText = "Director";
            headers[2].innerText = "Premiere";
            headers[3].innerText = "Thumbnail URL";

            let thumbnailInput = document.createElement("input");
            let titleInput = document.createElement("input");
            let directorInput = document.createElement("input");
            let premiereInput = document.createElement("input");

            thumbnailInput.classList.add("thumbnailInput");
            titleInput.classList.add("titleInput");
            directorInput.classList.add("directorInput");
            premiereInput.classList.add("premiereInput");

            thumbnailInput.type = "text";
            titleInput.type = "text";
            directorInput.type = "text";
            premiereInput.type = "text";

            thumbnailInput.value = thumbnail.src;
            titleInput.value = title.innerText;
            directorInput.value = directorText.innerText;
            premiereInput.value = premiereText.innerText;

            thumbnail.classList.add("hidden");
            title.classList.add("hidden");
            director.classList.add("hidden");
            premiere.classList.add("hidden");

            movie.appendChild(name);
            movie.appendChild(headers[0]);
            movie.appendChild(titleInput);
            movie.appendChild(headers[1]);
            movie.appendChild(directorInput);
            movie.appendChild(headers[2]);
            movie.appendChild(premiereInput);
            movie.appendChild(headers[3]);
            movie.appendChild(thumbnailInput);
            movie.appendChild(submitEdits);
            movie.appendChild(cancelEdits);

            submitEdits.addEventListener("click", function(event) {
                event.preventDefault();
                editMovieDetails(movie, thumbnailInput.value, titleInput.value, directorInput.value, premiereInput.value);

                thumbnail.classList.remove("hidden");
                title.classList.remove("hidden");
                director.classList.remove("hidden");
                premiere.classList.remove("hidden");

                movie.removeChild(name);
                movie.removeChild(headers[0]);
                movie.removeChild(headers[1]);
                movie.removeChild(headers[2]);
                movie.removeChild(headers[3]);
                movie.removeChild(thumbnailInput);
                movie.removeChild(premiereInput);
                movie.removeChild(titleInput);
                movie.removeChild(directorInput);
                movie.removeChild(submitEdits);
                movie.removeChild(cancelEdits);
                edit.classList.remove("disabled");
            });

            cancelEdits.addEventListener("click", function(event) {
                event.preventDefault();

                thumbnail.classList.remove("hidden");
                title.classList.remove("hidden");
                director.classList.remove("hidden");
                premiere.classList.remove("hidden");

                movie.removeChild(name);
                movie.removeChild(headers[0]);
                movie.removeChild(headers[1]);
                movie.removeChild(headers[2]);
                movie.removeChild(headers[3]);
                movie.removeChild(thumbnailInput);
                movie.removeChild(premiereInput);
                movie.removeChild(titleInput);
                movie.removeChild(directorInput);
                movie.removeChild(submitEdits);
                movie.removeChild(cancelEdits);
                edit.classList.remove("disabled");
            });
        });

        movieList.appendChild(movie);
    }

    function editMovieDetails(card, newThumbnail, newTitle, newDirector, newPremiere) {
        let key = card.getAttribute("data-id");
        let data = {
            title: newTitle,
            director: newDirector,
            premiere: newPremiere,
            thumbnail: newThumbnail
        };

        db.ref("movies/" + key).set(data);
    }

    function changeNumbers() {
        firstChoice.classList.remove("hide");
        secondChoice.classList.remove("hide");
        thirdChoice.classList.remove("hide");
        fourthChoice.classList.remove("hide");
        fifthChoice.classList.remove("hide");

        if(results.length <= moviesPerPage) {
            firstChoice.classList.add("hide");
            secondChoice.classList.add("hide");
            fourthChoice.classList.add("hide");
            fifthChoice.classList.add("hide");
        }
        
        if((page - 1) <= 0) {
            firstChoice.classList.add("hide");
            secondChoice.classList.add("hide");
        }
        
        if((page - 2) <= 0) {
            firstChoice.classList.add("hide");
        }
        
        if(page == Math.ceil(results.length/moviesPerPage)) {
            fourthChoice.classList.add("hide");
            fifthChoice.classList.add("hide");
        }
        
        if(page == Math.ceil(results.length/moviesPerPage) - 1 ) {
            fifthChoice.classList.add("hide");
        }

        firstChoice.innerText = (page - 2);
        secondChoice.innerText = (page - 1);
        thirdChoice.innerText = page;
        fourthChoice.innerText = (page + 1);
        fifthChoice.innerText = (page + 2);
    }

    function disableButtons() {
        // If there's only 1 page, disable both.
        if(results.length <= moviesPerPage) {
            nextPage.classList.add("disabled");
            prevPage.classList.add("disabled");
        }
        // Can't go to page 0, so disable previous page.
        else if(page == 1) {
            prevPage.classList.add("disabled");
        }
        // Can go back to page 1 again, so enable it.
        else if(page == 2) {
            prevPage.classList.remove("disabled");
        }
        // If you've reached the last page, disable next page.
        else if(page == Math.ceil(results.length/moviesPerPage)) {
            nextPage.classList.add("disabled");
        }
        // If you go back, enable next page again.
        else if(page <= Math.ceil(results.length/moviesPerPage) - 1) {
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

            displayMovies(moviesPerPage);
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
        query = query.toLowerCase();

        results = movies.filter(function(movie) {
            let title = movie.title.toLowerCase();
            let director = movie.director.toLowerCase();
            let thumbnail = movie.thumbnail.toLowerCase();
            let premiere = movie.premiere.toLowerCase();

            let containsQuery = false;

            if(title.indexOf(query) !== -1 || director.indexOf(query) !== -1 || thumbnail.indexOf(query) !== -1 || premiere.indexOf(query) !== -1) {
                containsQuery = true;
            }

            if(containsQuery) {
                return movie;
            }
        });

        page = 1;

        changeNumbers();
        disableButtons();
        displayMovies(moviesPerPage);
    }

    function dynamicSort(sortOrder, type) {
        return function (a,b) {
            var result = (a[type].toLowerCase() < b[type].toLowerCase()) ? -1 : (a[type].toLowerCase() > b[type].toLowerCase()) ? 1 : 0;
            return result * sortOrder;
        }
    }

    function sortMovies() {
        let sortOrder = document.querySelector('option[name="order"]:checked').value;
        let type = sorting.value;
        results.sort(dynamicSort(sortOrder, type));
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

    searchInput.addEventListener("input", function() {
        search(searchInput.value);
    });

    sorting.addEventListener("change", function() {
        displayMovies(moviesPerPage);
    });

    order.addEventListener("change", function() {
        displayMovies(moviesPerPage);
    });

    getMoviesFromDatabase();
}