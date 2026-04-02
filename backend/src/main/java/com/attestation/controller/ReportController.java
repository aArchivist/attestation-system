package com.attestation.controller;

import com.attestation.dto.TeacherSummaryDTO;
import com.attestation.model.DeadlineStatus;
import com.attestation.service.AttestationService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final AttestationService attestationService;

    @GetMapping("/red-list")
    @PreAuthorize("hasAnyRole('HEAD','ADMIN')")
    public List<TeacherSummaryDTO> getRedList() {
        return attestationService.getRedList();
    }

    @GetMapping("/attestation-year")
    @PreAuthorize("hasAnyRole('HEAD','ADMIN')")
    public List<TeacherSummaryDTO> getByYear(@RequestParam int year) {
        return attestationService.getByAttestationYear(year);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('HEAD','ADMIN')")
    public Map<String, Object> getSummary() {
        List<TeacherSummaryDTO> all = attestationService.getAllSummaries();
        return Map.of(
            "total", all.size(),
            "critical", all.stream().filter(s -> s.getDeadlineStatus() == DeadlineStatus.CRITICAL).count(),
            "warning", all.stream().filter(s -> s.getDeadlineStatus() == DeadlineStatus.WARNING).count(),
            "ok", all.stream().filter(s -> s.getDeadlineStatus() == DeadlineStatus.OK).count()
        );
    }
}
