package com.moviebooking.controller;

import com.moviebooking.entity.Movie;
import com.moviebooking.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Movie Management", description = "APIs for managing movies in the ticket booking system")
public class MovieController {

    @Autowired
    private MovieRepository movieRepository;

    @GetMapping
    @Operation(summary = "Get all movies", description = "Retrieve a list of all movies")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<Movie> getAllMovies() {
        return movieRepository.findByActiveTrue();
    }

    @GetMapping("/search")
    @Operation(summary = "Search movies by title", description = "Retrieve active movies filtered by title substring (case-insensitive)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<Movie> searchMovies(@RequestParam(name = "q") String query) {
        if (query == null || query.isBlank()) {
            return movieRepository.findByActiveTrue();
        }
        return movieRepository.findByTitleContainingIgnoreCaseAndActiveTrue(query.trim());
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
    public ResponseEntity<Movie> getMovieById(
            @Parameter(description = "Movie ID", required = true) @PathVariable Long id) {
        Optional<Movie> movie = movieRepository.findById(id);
        return movie.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/theater/{theaterId}")
    @Operation(summary = "Get movies by theater", description = "Retrieve all movies for a specific theater")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<Movie> getMoviesByTheater(
            @Parameter(description = "Theater ID", required = true) @PathVariable Long theaterId) {
        return movieRepository.findByTheaterIdAndActiveTrue(theaterId);
    }

    @PostMapping
    @Operation(summary = "Create new movie", description = "Add a new movie to the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Movie created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Movie createMovie(
            @Parameter(description = "Movie object", required = true) @RequestBody Movie movie) {
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
}
