package com.economic.dto;

import lombok.Data;

// ========== RegisterRequest.java ==========
// Use as separate file in your project
public class AuthDTOs {

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private String phone;
        private String role; // INDIVIDUAL or FAMILY
        private String name;
        private String city;
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String role;
        private Long userId;

        public AuthResponse(String token, String username, String role, Long userId) {
            this.token = token;
            this.username = username;
            this.role = role;
            this.userId = userId;
        }
    }

    @Data
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;

        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
}
