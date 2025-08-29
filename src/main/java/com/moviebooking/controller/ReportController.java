package com.moviebooking.controller;

import com.moviebooking.service.AnalyticsService;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/report")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class ReportController {

    private final AnalyticsService analyticsService;

    public ReportController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping("/daily")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<byte[]> daily(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) throws DocumentException {
        LocalDate d = (date != null) ? date : LocalDate.now();
        Map<String, Object> kpisResp = analyticsService.getKpis(d, d);
        List<Map<String, Object>> bookingsSeries = analyticsService.getSeriesBookings(d, d, "hour");
        List<Map<String, Object>> revenueSeries = analyticsService.getSeriesRevenue(d, d, "hour");

        // Additional windows for richer report
        LocalDate last7From = d.minusDays(6);
        List<Map<String, Object>> last7Bookings = analyticsService.getSeriesBookings(last7From, d, "day");
        List<Map<String, Object>> last7Revenue = analyticsService.getSeriesRevenue(last7From, d, "day");

        // Month-to-date and Year-to-date KPIs
        LocalDate mtdFrom = d.withDayOfMonth(1);
        LocalDate ytdFrom = d.withDayOfYear(1);
        Map<String, Object> kpisMtd = analyticsService.getKpis(mtdFrom, d);
        Map<String, Object> kpisYtd = analyticsService.getKpis(ytdFrom, d);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfWriter.getInstance(doc, baos);
        doc.open();

        doc.add(new Paragraph("Movie Platform Daily Report - " + d));
        doc.add(new Paragraph("\nKPIs:"));
        @SuppressWarnings("unchecked") Map<String, Object> kpis = (Map<String, Object>) kpisResp.get("kpis");
        doc.add(new Paragraph("  Bookings: " + ((Map<?,?>)kpis.get("bookings")).get("count")));
        doc.add(new Paragraph("  Revenue: " + ((Map<?,?>)kpis.get("revenue")).get("total")));
        doc.add(new Paragraph("  DAU: " + kpis.get("dau")));
        doc.add(new Paragraph("  MAU: " + kpis.get("mau")));
        doc.add(new Paragraph("  Approval Rate: " + kpis.get("approvalRate")));

        doc.add(new Paragraph("\nHourly Bookings:"));
        for (Map<String, Object> p : bookingsSeries) {
            doc.add(new Paragraph("  " + p.get("t") + " -> " + p.get("v")));
        }

        doc.add(new Paragraph("\nHourly Revenue:"));
        for (Map<String, Object> p : revenueSeries) {
            doc.add(new Paragraph("  " + p.get("t") + " -> " + p.get("v")));
        }

        // Last 7 days daily series
        doc.add(new Paragraph("\nLast 7 Days - Daily Bookings (" + last7From + " to " + d + "):"));
        for (Map<String, Object> p : last7Bookings) {
            doc.add(new Paragraph("  " + p.get("t") + " -> " + p.get("v")));
        }
        doc.add(new Paragraph("\nLast 7 Days - Daily Revenue (" + last7From + " to " + d + "):"));
        for (Map<String, Object> p : last7Revenue) {
            doc.add(new Paragraph("  " + p.get("t") + " -> " + p.get("v")));
        }

        // MTD KPIs
        @SuppressWarnings("unchecked") Map<String, Object> mtdK = (Map<String, Object>) kpisMtd.get("kpis");
        doc.add(new Paragraph("\nMonth-to-Date KPIs (" + mtdFrom + " to " + d + "):"));
        doc.add(new Paragraph("  Bookings: " + ((Map<?,?>)mtdK.get("bookings")).get("count")));
        doc.add(new Paragraph("  Revenue: " + ((Map<?,?>)mtdK.get("revenue")).get("total")));
        doc.add(new Paragraph("  DAU: " + mtdK.get("dau")));
        doc.add(new Paragraph("  MAU: " + mtdK.get("mau")));
        doc.add(new Paragraph("  Approval Rate: " + mtdK.get("approvalRate")));

        // YTD KPIs
        @SuppressWarnings("unchecked") Map<String, Object> ytdK = (Map<String, Object>) kpisYtd.get("kpis");
        doc.add(new Paragraph("\nYear-to-Date KPIs (" + ytdFrom + " to " + d + "):"));
        doc.add(new Paragraph("  Bookings: " + ((Map<?,?>)ytdK.get("bookings")).get("count")));
        doc.add(new Paragraph("  Revenue: " + ((Map<?,?>)ytdK.get("revenue")).get("total")));
        doc.add(new Paragraph("  DAU: " + ytdK.get("dau")));
        doc.add(new Paragraph("  MAU: " + ytdK.get("mau")));
        doc.add(new Paragraph("  Approval Rate: " + ytdK.get("approvalRate")));

        doc.close();

        String filename = "daily-report-" + d + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(baos.toByteArray());
    }
}
