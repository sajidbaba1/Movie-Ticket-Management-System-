package com.moviebooking.dto;

import com.moviebooking.entity.User;

public class LoginResponse {

  private User user;
  private String token;
  private String message;

  // Default constructor
  public LoginResponse() {
  }

  // Constructor with parameters
  public LoginResponse(User user, String token) {
    this.user = user;
    this.token = token;
    this.message = "Login successful";
  }

  // Constructor for error response
  public LoginResponse(String message) {
    this.message = message;
  }

  // Getters and Setters
  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  @Override
  public String toString() {
    return "LoginResponse{" +
        "user=" + user +
        ", token='[PROTECTED]'" +
        ", message='" + message + '\'' +
        '}';
  }
}