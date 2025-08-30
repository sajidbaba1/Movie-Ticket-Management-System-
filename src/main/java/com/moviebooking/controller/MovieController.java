package com.moviebooking.controller;

import com.moviebooking.entity.Movie;
import com.moviebooking.entity.User;
import com.moviebooking.entity.Theater;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/movies")
@Tag(name = "Movie Management", description = "APIs for managing movies in the ticket booking system")
public class MovieController {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @GetMapping
    @Operation(summary = "Get all movies", description = "Retrieve a list of all movies")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved movies", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findByActiveTrue()
                .stream()
                .map(MovieResponse::from)
                .toList();
    }

    @GetMapping("/search")
    @Operation(summary = "Search movies by title", description = "Retrieve active movies filtered by title substring (case-insensitive)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<MovieResponse> searchMovies(@RequestParam(name = "q") String query) {
        List<Movie> results;
        if (query == null || query.isBlank()) {
            results = movieRepository.findByActiveTrue();
        } else {
            results = movieRepository.findByTitleContainingIgnoreCaseAndActiveTrue(query.trim());
        }
        return results.stream().map(MovieResponse::from).toList();
    }

    @GetMapping("/count")
    @Operation(summary = "Get active movies count", description = "Returns the number of active movies")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count returned"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Long getActiveMoviesCount() {
        return movieRepository.countByActiveTrue();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get movie by ID", description = "Retrieve a specific movie by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved movie", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "404", description = "Movie not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<MovieResponse> getMovieById(
            @Parameter(description = "Movie ID", required = true) @PathVariable Long id) {
        Optional<Movie> movie = movieRepository.findById(id);
        return movie.map(m -> ResponseEntity.ok(MovieResponse.from(m)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/theater/{theaterId}")
    @Operation(summary = "Get movies by theater", description = "Retrieve all movies for a specific theater")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<MovieResponse> getMoviesByTheater(
            @Parameter(description = "Theater ID", required = true) @PathVariable Long theaterId) {
        return movieRepository.findByTheaterIdAndActiveTrue(theaterId)
                .stream()
                .map(MovieResponse::from)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    @Operation(summary = "Create new movie", description = "Add a new movie to the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Movie created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Movie createMovie(
            @Parameter(description = "Movie object", required = true) @RequestBody Movie movie) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Only attempt to resolve the authenticated user if authentication is present and not anonymous
        if (auth != null && auth.isAuthenticated()) {
            String name = auth.getName();
            if (name != null && !"anonymousUser".equalsIgnoreCase(name)) {
                User user = userRepository.findByEmail(name)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                // If the creator is a theater owner, automatically associate their theater
                if (user.getRole() == User.UserRole.THEATER_OWNER) {
                    List<Theater> theaters = theaterRepository.findByOwnerId(user.getId());
                    if (theaters.isEmpty()) {
                        throw new RuntimeException("Theater not found for user");
                    }
                    Theater theater = theaters.get(0);
                    movie.setTheater(theater);
                }
            }
        }

        // For admins (or when security context is unavailable), respect the theater provided in payload
        return movieRepository.save(movie);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update movie", description = "Update an existing movie's information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Movie updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "404", description = "Movie not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Movie> updateMovie(
            @Parameter(description = "Movie ID", required = true) @PathVariable Long id,
            @Parameter(description = "Updated movie object", required = true) @RequestBody Movie movieDetails) {
        Optional<Movie> movie = movieRepository.findById(id);
        if (movie.isPresent()) {
            Movie updatedMovie = movie.get();
            updatedMovie.setTitle(movieDetails.getTitle());
            updatedMovie.setDescription(movieDetails.getDescription());
            updatedMovie.setGenre(movieDetails.getGenre());
            updatedMovie.setDirector(movieDetails.getDirector());
            updatedMovie.setDuration(movieDetails.getDuration());
            updatedMovie.setReleaseDate(movieDetails.getReleaseDate());
            updatedMovie.setPosterUrl(movieDetails.getPosterUrl());
            updatedMovie.setActive(movieDetails.isActive());
            updatedMovie.setTheater(movieDetails.getTheater());
            return ResponseEntity.ok(movieRepository.save(updatedMovie));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete movie", description = "Delete a movie from the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Movie deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Movie not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteMovie(
            @Parameter(description = "Movie ID", required = true) @PathVariable Long id) {
        Optional<Movie> movie = movieRepository.findById(id);
        if (movie.isPresent()) {
            movieRepository.delete(movie.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Lightweight DTOs to avoid lazy-loading serialization problems
    public static class MovieResponse {
        public Long id;
        public String title;
        public String description;
        public String genre;
        public String director;
        public Integer duration;
        public java.time.LocalDate releaseDate;
        public String posterUrl;
        public boolean active;
        public java.time.LocalDateTime createdAt;
        public String status;
        public TheaterSummary theater;

        public static MovieResponse from(Movie m) {
            MovieResponse r = new MovieResponse();
            r.id = m.getId();
            r.title = m.getTitle();
            r.description = m.getDescription();
            r.genre = m.getGenre();
            r.director = m.getDirector();
            r.duration = m.getDuration();
            r.releaseDate = m.getReleaseDate();
            r.posterUrl = m.getPosterUrl();
            r.active = m.isActive();
            r.createdAt = m.getCreatedAt();
            r.status = m.getStatus() != null ? m.getStatus().name() : null;
            if (m.getTheater() != null) {
                r.theater = TheaterSummary.from(m.getTheater());
            }
            return r;
        }
    }

    public static class TheaterSummary {
        public Long id;
        public String name;
        public String city;

        public static TheaterSummary from(com.moviebooking.entity.Theater t) {
            TheaterSummary ts = new TheaterSummary();
            ts.id = t.getId();
            try { ts.name = t.getName(); } catch (Exception ignored) {}
            try { ts.city = t.getCity(); } catch (Exception ignored) {}
            return ts;
        }
    }
}
