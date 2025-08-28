package com.moviebooking.controller;

import com.moviebooking.entity.Theater;
import com.moviebooking.repository.TheaterRepository;
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
@RequestMapping("/api/theaters")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Theater Management", description = "APIs for managing theaters in the ticket booking system")
public class TheaterController {

    @Autowired
    private TheaterRepository theaterRepository;

    @GetMapping
    @Operation(summary = "Get all theaters", description = "Retrieve a list of all approved and active theaters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved theaters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Theater.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<Theater> getAllTheaters() {
        return theaterRepository.findByApprovedTrueAndActiveTrue();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get theater by ID", description = "Retrieve a specific theater by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved theater", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Theater.class))),
            @ApiResponse(responseCode = "404", description = "Theater not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Theater> getTheaterById(
            @Parameter(description = "Theater ID", required = true) @PathVariable Long id) {
        Optional<Theater> theater = theaterRepository.findById(id);
        return theater.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/city/{city}")
    @Operation(summary = "Get theaters by city", description = "Retrieve all theaters in a specific city")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved theaters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Theater.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<Theater> getTheatersByCity(
            @Parameter(description = "City name", required = true) @PathVariable String city) {
        return theaterRepository.findByCityAndApprovedTrueAndActiveTrue(city);
    }

    @GetMapping("/owner/{ownerId}")
    @Operation(summary = "Get theaters by owner", description = "Retrieve all theaters owned by a specific user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved theaters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Theater.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public List<Theater> getTheatersByOwner(
            @Parameter(description = "Owner ID", required = true) @PathVariable Long ownerId) {
        return theaterRepository.findByOwnerId(ownerId);
    }

    @PostMapping
    @Operation(summary = "Create new theater", description = "Add a new theater to the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Theater created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Theater.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Theater createTheater(
            @Parameter(description = "Theater object", required = true) @RequestBody Theater theater) {
        return theaterRepository.save(theater);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update theater", description = "Update an existing theater's information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Theater updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Theater.class))),
            @ApiResponse(responseCode = "404", description = "Theater not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Theater> updateTheater(
            @Parameter(description = "Theater ID", required = true) @PathVariable Long id,
            @Parameter(description = "Updated theater object", required = true) @RequestBody Theater theaterDetails) {
        Optional<Theater> theater = theaterRepository.findById(id);
        if (theater.isPresent()) {
            Theater updatedTheater = theater.get();
            return ResponseEntity.ok(theaterRepository.save(updatedTheater));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete theater", description = "Delete a theater from the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Theater deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Theater not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteTheater(
            @Parameter(description = "Theater ID", required = true) @PathVariable Long id) {
        Optional<Theater> theater = theaterRepository.findById(id);
        if (theater.isPresent()) {
            theaterRepository.delete(theater.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}