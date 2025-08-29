package com.moviebooking.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private static final int OTP_TTL_SECONDS = 300; // 5 minutes
    private final Random random = new Random();

    private static class OtpEntry {
        String code;
        Instant expiresAt;
        OtpEntry(String code, Instant expiresAt) { this.code = code; this.expiresAt = expiresAt; }
    }

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    public String generateOtp(String email) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        store.put(email.toLowerCase(), new OtpEntry(code, Instant.now().plusSeconds(OTP_TTL_SECONDS)));
        return code;
    }

    public boolean verifyOtp(String email, String code) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiresAt)) {
            store.remove(email.toLowerCase());
            return false;
        }
        boolean ok = entry.code.equals(code);
        if (ok) store.remove(email.toLowerCase());
        return ok;
    }
}
