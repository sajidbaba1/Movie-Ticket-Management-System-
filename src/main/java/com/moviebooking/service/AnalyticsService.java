package com.moviebooking.service;

import com.moviebooking.entity.Booking;
import com.moviebooking.entity.EventLog;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.EventLogRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private final BookingRepository bookingRepository;
    private final EventLogRepository eventLogRepository;

    public AnalyticsService(BookingRepository bookingRepository, EventLogRepository eventLogRepository) {
        this.bookingRepository = bookingRepository;
        this.eventLogRepository = eventLogRepository;
    }

    public Map<String, Object> getKpis(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        List<Booking> bookings = bookingRepository.findByCreatedAtBetween(start, end);

        int count = bookings.size();
        BigDecimal revenue = bookings.stream()
                .map(Booking::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long dau = bookings.stream().collect(Collectors.groupingBy(b -> b.getCreatedAt().toLocalDate())).size();
        long mau = bookings.stream().collect(Collectors.groupingBy(b -> b.getCreatedAt().getMonth())).size();

        List<EventLog> events = eventLogRepository.findAll();
        long approves = events.stream()
                .filter(e -> within(e.getAt(), start, end))
                .filter(e -> Objects.equals(e.getEventType(), "APPROVE"))
                .count();
        long rejects = events.stream()
                .filter(e -> within(e.getAt(), start, end))
                .filter(e -> Objects.equals(e.getEventType(), "REJECT"))
                .count();
        double approvalRate = (approves + rejects) == 0 ? 1.0 : (double) approves / (approves + rejects);

        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("bookings", Map.of("count", count));
        kpis.put("revenue", Map.of("total", revenue));
        kpis.put("dau", dau);
        kpis.put("mau", mau);
        kpis.put("approvalRate", approvalRate);
        return Map.of("range", Map.of("from", from.toString(), "to", to.toString()), "kpis", kpis);
    }

    public List<Map<String, Object>> getSeriesBookings(LocalDate from, LocalDate to, String bucket) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        List<Booking> bookings = bookingRepository.findByCreatedAtBetween(start, end);
        Map<String, Long> grouped;
        if ("hour".equalsIgnoreCase(bucket)) {
            grouped = bookings.stream().collect(Collectors.groupingBy(
                    b -> b.getCreatedAt().withMinute(0).withSecond(0).withNano(0).toString(), Collectors.counting()
            ));
        } else {
            grouped = bookings.stream().collect(Collectors.groupingBy(
                    b -> b.getCreatedAt().toLocalDate().toString(), Collectors.counting()
            ));
        }
        return toSeries(grouped);
    }

    public List<Map<String, Object>> getSeriesRevenue(LocalDate from, LocalDate to, String bucket) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        List<Booking> bookings = bookingRepository.findByCreatedAtBetween(start, end);
        Map<String, BigDecimal> grouped;
        if ("hour".equalsIgnoreCase(bucket)) {
            grouped = bookings.stream().collect(Collectors.groupingBy(
                    b -> b.getCreatedAt().withMinute(0).withSecond(0).withNano(0).toString(),
                    Collectors.reducing(BigDecimal.ZERO, Booking::getTotalAmount, BigDecimal::add)
            ));
        } else {
            grouped = bookings.stream().collect(Collectors.groupingBy(
                    b -> b.getCreatedAt().toLocalDate().toString(),
                    Collectors.reducing(BigDecimal.ZERO, Booking::getTotalAmount, BigDecimal::add)
            ));
        }
        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("t", e.getKey());
                    m.put("v", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }

    private boolean within(LocalDateTime at, LocalDateTime start, LocalDateTime end) {
        return at != null && !at.isBefore(start) && !at.isAfter(end);
    }

    private List<Map<String, Object>> toSeries(Map<String, Long> grouped) {
        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("t", e.getKey());
                    m.put("v", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }
}
